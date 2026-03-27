import { HealthMeasurementDTO, MeasurementUnitDTO } from "../../types/models";
import { PatientDTO } from "../../types/patients";

enum allowedMethods
{
    GET,
    POST,
    PUT,
    DELETE
}

class Backend
{
    private baseUrl: string;
    private jwt: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.baseUrl = 'https://sehatscan-abgtfbb6cmgmgugr.uaenorth-01.azurewebsites.net';
    }

    // =========================
    // Authentication
    // =========================
    private async request(endpoint: string, method: allowedMethods, body?: any) {
        return await fetch(`${this.baseUrl}${endpoint}`, {
            method: allowedMethods[method],
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.jwt ? `Bearer ${this.jwt}` : undefined
            },
            body: JSON.stringify(body)
        });
    }

    async requestcode(email: string)
    {
        const response = await this.request('/auth/requestcode', allowedMethods.POST, { email });

        if (!response.ok)
        {
            throw new Error(`Error in requesting code: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async verifycode(email: string, code: string) : Promise<Record<string, any>>
    {
        if (!email || !code) throw new Error('Email and code are required for verification');

        const response = await this.request('/auth/verifycode', allowedMethods.POST, { email, code });

        if (response.status === 404) {
            return { needsRegistration: true };
        }

        if (!response.ok) {
            console.log(`Error in verifying code: ${response.status} ${response.statusText}: ${await response.text()}`)
            throw new Error(`Error in verifying code: ${response.status} ${response.statusText}: ${await response.text()}`);
        }

        const data = await response.json();
        this.jwt = data.jwt;
        this.refreshToken = data.refreshToken;

        return data;
    }

    async register(patientInfo: PatientDTO)
    {
        const response = await this.request('/auth/register', allowedMethods.POST, patientInfo);
        if (!response.ok) {
            throw new Error(`Error in registering patient: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async refresh()
    {
        if (!this.refreshToken) throw new Error('No refresh token available');

        const response = await this.request('/auth/refresh', allowedMethods.POST);
        if (!response.ok) {
            throw new Error(`Error in refreshing token: ${response.status} ${response.statusText}`);
        }
        
        this.jwt = (await response.json()).jwt;
    }

    // =========================
    // Patients
    // =========================
    async getPatients()
    {
        const response = await this.request('/patients', allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patients: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async getPatientById(id: string)
    {
        const response = await this.request(`/patients/?id=${id}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async getPatientByEmail(email: string)
    {
        const response = await this.request(`/patients/?email=${email}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async getPatientByName(name: string)
    {
        const response = await this.request(`/patients/?name=${name}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching patient: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    // =========================
    // Health Measurements
    // =========================
    async getMeasurementsByPatient(patientId: string)
    {
        const response = await this.request(`/health-measurement/?patient_id=${patientId}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching health measurements: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async getMeasurementById(id: string)
    {
        const response = await this.request(`/health-measurement/?id=${id}`, allowedMethods.GET);

        if (!response.ok) {
            throw new Error(`Error in fetching health measurement: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async createHealthMeasurement(measurement: HealthMeasurementDTO)
    {
        const response = await this.request('/health-measurement', allowedMethods.POST, measurement);
        if (!response.ok) {
            throw new Error(`Error in creating health measurement: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    async createMeasurementUnit(unit: MeasurementUnitDTO)
    {
        const response = await this.request('/health-measurement/unit', allowedMethods.POST, unit);
        if (!response.ok) {
            throw new Error(`Error in creating measurement unit: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
}

const backend = new Backend();
export default backend;