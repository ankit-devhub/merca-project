import axios from "axios"
import { apiBaseUrl } from "../../env";

export const getPeriodlyReport = async (customerId: string) => {
    const { data: res } = await axios.get(`${apiBaseUrl}/period?customerId=${customerId}`)
    if (!res) return {
        status: '400',
        message: 'bad request',
    }
    return res;
}

export const getMonthlyReport = async (customerId: string) => {
    const { data: res } = await axios.get(`${apiBaseUrl}/monthly?customerId=${customerId}`)
    if (!res) return {
        status: '400',
        message: 'bad request',
    }
    return res;
}