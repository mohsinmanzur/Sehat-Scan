import { createPatientDTO } from "./dto/createpatient.dto";

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

    async verifycode(email: string, code: string)
    {
        const response = await this.request('/auth/verifycode', allowedMethods.POST, { email, code });
        if (response.ok) {
            const data = await response.json();
            this.jwt = data.jwt;
            this.refreshToken = data.refreshToken;
        }
        else {
            throw new Error(`Error in verifying code: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async register(patientInfo: createPatientDTO)
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
}