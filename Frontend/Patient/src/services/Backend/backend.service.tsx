import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AccessGrant, HealthMeasurement, MeasurementUnit, Patient, ReferenceRange, ShareMeasurementDTO } from "../../types/types";
import { UpdateHealthMeasurement } from "../../types/updatetypes";
import { MeasurementUnitDTO } from "../../types/parameters";
import { removeValue } from "../Storage/storage.service";
import { AiExtractionResult, UploadMedicalDocument } from '../../types/others';
import { API_BASE_URL } from '@env';

// On web, React Native's FormData coerces `{uri,name,type}` to the string
// "[object Object]". Fetch the URI as a Blob so multipart works in browsers.
async function appendImageToFormData(formData: FormData, uri: string, name: string, type: string) {
    if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append('file', blob, name);
    } else {
        formData.append('file', { uri, name, type } as any);
    }
}

enum allowedMethods {
    GET,
    POST,
    PUT,
    DELETE
}

class Backend {
    private baseUrl: string;
    private jwtToken: string | null = null;
    private refreshToken: string | null = null;
    private isRefreshing: boolean = false;
    private onLogoutCallback: (() => void) | null = null;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    setOnLogout(callback: () => void) {
        this.onLogoutCallback = callback;
    }

    // =========================
    // Miscellaneous
    // =========================
    private async readTokensFromStorage() {
        const storedJwt = await SecureStore.getItemAsync('jwtToken');
        const storedRefresh = await SecureStore.getItemAsync('refreshToken');

        if (storedJwt && storedRefresh) {
            this.jwtToken = storedJwt;
            this.refreshToken = storedRefresh;
        }
    }

    async refreshJWT() {
        if (this.isRefreshing) return false;
        if (!this.refreshToken) {
            await this.logout();
            return false;
        }

        this.isRefreshing = true;
        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: allowedMethods[allowedMethods.POST],
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.refreshToken}`,
                }
            });

            if (!response.ok) {
                await this.logout();
                return false;
            }

            const data = await response.json();
            this.jwtToken = data.jwt;
            await SecureStore.setItemAsync('jwtToken', data.jwt);

            return true;
        } finally {
            this.isRefreshing = false;
        }
    }

    private async request(endpoint: string, method: allowedMethods, body?: any, _isRetry = false, content_type: string | null = 'application/json'): Promise<Response> {
        if (!this.jwtToken || !this.refreshToken) {
            await this.readTokensFromStorage();
        }

        const headers: Record<string, string> = {};

        if (content_type) {
            headers['Content-Type'] = content_type;
        }

        if (this.jwtToken) {
            headers['Authorization'] = `Bearer ${this.jwtToken}`;
        }

        const options: RequestInit = {
            method: allowedMethods[method],
            headers,
        };

        if (body && options.method !== 'GET' && options.method !== 'HEAD') {
            options.body = body instanceof FormData ? body : JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);

        if (response.status === 401 && !_isRetry) {
            const refreshed = await this.refreshJWT();

            if (refreshed) {
                return await this.request(endpoint, method, body, true);
            } else {
                // If refresh failed (or was already handled by logout in refreshJWT)
                // we return the 401 so the caller can handle it if needed.
                return response;
            }
        }

        return response;
    }

    // =========================
    // Authentication
    // =========================
    async requestcode(email: string) {
        const response = await this.request('/auth/requestcode', allowedMethods.POST, { email });

        if (!response.ok) {
            console.log(`Error in requesting code: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        return await response.json();
    }

    async verifycode(email: string, code: string): Promise<Record<string, any>> {
        if (!email || !code) throw new Error('Email and code are required for verification');

        const response = await this.request('/auth/verifycode', allowedMethods.POST, { email, code });

        if (response.status === 404) {
            return { needsRegistration: true };
        }

        if (!response.ok) {
            throw new Error(`Error in verifying code: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        const data = await response.json();

        this.jwtToken = data.jwtToken;
        this.refreshToken = data.refreshToken;

        await SecureStore.setItemAsync('jwtToken', data.jwtToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        return data;
    }

    async registerPatient(patientInfo: Patient) {
        const response = await this.request('/auth/register', allowedMethods.POST, patientInfo);
        if (!response.ok) {
            throw new Error(`Error in registering patient: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        const data = await response.json();

        this.jwtToken = data.jwtToken;
        this.refreshToken = data.refreshToken;

        await SecureStore.setItemAsync('jwtToken', data.jwtToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        return data;
    }

    async logout() {
        this.jwtToken = null;
        this.refreshToken = null;
        await SecureStore.deleteItemAsync('jwtToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await removeValue('currentPatient');
        if (this.onLogoutCallback) {
            this.onLogoutCallback();
        }
    }

    // =========================
    // Patients
    // =========================
    async getPatients() {
        const response = await this.request('/patient', allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patients: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        return await response.json();
    }

    async getPatientById(id: string) {
        const response = await this.request(`/patient/?id=${id}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        return await response.json();
    }

    async getPatientByEmail(email: string) {
        const response = await this.request(`/patient/?email=${email}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        const data = await response.json();
        return data;
    }

    async getPatientByName(name: string) {
        const response = await this.request(`/patient/?name=${name}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        return await response.json();
    }

    // =========================
    // Health Measurements
    // =========================
    async getMeasurementsByPatient(patientId: string): Promise<HealthMeasurement[]> {
        const response = await this.request(`/health-measurement/?patient_id=${patientId}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching health measurements: ${response.status} ${await response.text()}`);
        }

        return await response.json();
    }

    async getMeasurementById(id: string): Promise<HealthMeasurement> {
        const response = await this.request(`/health-measurement/?id=${id}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching health measurement: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        return await response.json();
    }

    async createHealthMeasurement(measurement: HealthMeasurement) {
        const response = await this.request('/health-measurement', allowedMethods.POST, measurement);
        if (!response.ok) {
            throw new Error(`Error in creating health measurement ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    async updateHealthMeasurement(id: string, measurement: UpdateHealthMeasurement) {
        const response = await this.request(`/health-measurement/?id=${id}`, allowedMethods.PUT, measurement);
        if (!response.ok) {
            throw new Error(`Error in updating health measurement ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    async deleteHealthMeasurement(id: string) {
        const response = await this.request(`/health-measurement/?id=${id}`, allowedMethods.DELETE);
        if (!response.ok) {
            throw new Error(`Error in deleting health measurement ${response.status} ${response.statusText}: ${await response.text()}`);
        }
    }

    async createMeasurementUnit(unit: MeasurementUnitDTO) {
        const response = await this.request('/health-measurement/unit', allowedMethods.POST, unit);
        if (!response.ok) {
            throw new Error(`Error in creating measurement unit ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    async getMeasurementUnits(): Promise<MeasurementUnit[]> {
        const response = await this.request('/health-measurement/unit', allowedMethods.GET);
        if (!response.ok) {
            throw new Error(`Error in fetching measurement units ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    // =========================
    // Medical Documents
    // =========================
    async getMedicalDocumentByID(Id: string) {
        const response = await this.request(`/record/?id=${Id}`, allowedMethods.GET);
        if (!response.ok) {
            throw new Error(`Error in fetching medical document ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    async getMedicalDocumentsByPatient(patientId: string) {
        const response = await this.request(`/record/?patient_id=${patientId}`, allowedMethods.GET);
        if (!response.ok) {
            throw new Error(`Error in fetching medical documents ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    async getDocumentUrlfromMeasurementId(Id: string) {
        const response = await this.request(`/record/document-url?id=${Id}`, allowedMethods.GET);
        if (!response.ok) {
            throw new Error(`Error in fetching document URL ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    async createandUploadMedicalDocument(data: UploadMedicalDocument) {
        const formData = new FormData();
        await appendImageToFormData(formData, data.file, data.file_name || 'upload.jpg', 'image/jpeg');
        formData.append('patient_id', data.patient_id);
        formData.append('record_type', data.record_type);
        if (data.ocr_extracted_text) {
            formData.append('ocr_extracted_text', data.ocr_extracted_text);
        }
        if (data.date_issued) {
            formData.append('date_issued', data.date_issued.toISOString());
        }
        if (data.created_at) {
            formData.append('created_at', data.created_at.toISOString());
        }

        const response = await this.request('/record/image/upload', allowedMethods.POST, formData, false, null);
        if (!response.ok) {
            throw new Error(`Error in uploading medical document ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    async getSecureDocumentUrl(file_url: string) {
        const response = await this.request('/record/image/get-secure-url', allowedMethods.POST, { file_url });
        if (!response.ok) {
            throw new Error(`Error in fetching secure document URL ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }

    // =========================
    // AI Extraction (Gemini)
    // =========================
    async extractMeasurementsFromImage(imageUri: string): Promise<AiExtractionResult> {
        const formData = new FormData();
        await appendImageToFormData(formData, imageUri, 'scan.jpg', 'image/jpeg');

        const response = await this.request('/ai/extract-measurements', allowedMethods.POST, formData, false, null);
        if (!response.ok) {
            throw new Error(`AI extraction failed ${response.status}: ${await response.text()}`);
        }
        return await response.json();
    }

    // =========================
    // Reference Ranges
    // =========================
    async getReferenceRanges(unit_id?: string): Promise<ReferenceRange[]> {
        const response = await this.request(`/health-measurement/reference-ranges${unit_id ? `/?unit_id=${unit_id}` : ''}`, allowedMethods.GET);
        if (!response.ok) {
            throw new Error(`Error in fetching reference ranges ${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    }
    // =========================
    // Sharing
    // =========================
    async shareMeasurement(patientId: string, shareData: ShareMeasurementDTO): Promise<AccessGrant> {
        const response = await this.request(`/share/?patient_id=${patientId}`, allowedMethods.POST, shareData);
        if (!response.ok) {
            throw new Error(`Error in sharing measurement: ${response.status} ${await response.text()}`);
        }
        return await response.json();
    }

    async getPatientShares(patientId: string): Promise<AccessGrant[]> {
        const response = await this.request(`/share/shares?patient_id=${patientId}`, allowedMethods.GET);
        if (!response.ok) {
            throw new Error(`Error in fetching shares: ${response.status} ${await response.text()}`);
        }
        return await response.json();
    }

    async getMeasurementsForShare(shareId: string): Promise<HealthMeasurement[]> {
        const response = await this.request(`/share/shared-measurements?share_id=${shareId}`, allowedMethods.GET);
        if (!response.ok) {
            throw new Error(`Error in fetching shared measurements: ${response.status} ${await response.text()}`);
        }
        return await response.json();
    }

    async revokeShare(patientId: string, shareId: string): Promise<AccessGrant> {
        const response = await this.request(`/share/revoke?patient_id=${patientId}&share_id=${shareId}`, allowedMethods.POST);
        if (!response.ok) {
            throw new Error(`Error in revoking share: ${response.status} ${await response.text()}`);
        }
        return await response.json();
    }

    async handleWebhook(receiverUuid: string, sharingId: string) {
        const response = await this.request(`/share/webhook`, allowedMethods.POST, { receiverUuid, sharingId });
        if (!response.ok) {
            throw new Error(`Error in handling webhook: ${response.status} ${await response.text()}`);
        }
        return await response.json();
    }

    async getSharedById(shareId: string): Promise<AccessGrant> {
        const response = await this.request(`/share/shared-by-id?share_id=${shareId}`, allowedMethods.GET);
        if (!response.ok) {
            throw new Error(`Error in fetching shared by id: ${response.status} ${await response.text()}`);
        }
        return await response.json();
    }
}

const backend = new Backend();
export default backend;