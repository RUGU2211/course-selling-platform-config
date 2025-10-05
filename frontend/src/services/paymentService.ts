import { apiService } from './api';
import { 
  Payment, 
  PaymentRequest, 
  PaginatedResponse, 
  PaginationParams 
} from '../types';

class PaymentService {
  private readonly BASE_PATH = '/payments';

  // Payment operations
  async createPayment(paymentData: PaymentRequest): Promise<Payment> {
    const response = await apiService.post<Payment>(this.BASE_PATH, paymentData);
    return response.data;
  }

  async getPaymentById(id: number): Promise<Payment> {
    const response = await apiService.get<Payment>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async getMyPayments(pagination?: PaginationParams): Promise<PaginatedResponse<Payment>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Payment>>(`${this.BASE_PATH}/my-payments`, params);
    return response.data;
  }

  async getPaymentsByEnrollment(enrollmentId: number): Promise<Payment[]> {
    const response = await apiService.get<Payment[]>(`${this.BASE_PATH}/enrollment/${enrollmentId}`);
    return response.data;
  }

  async updatePaymentStatus(id: number, status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'): Promise<Payment> {
    const response = await apiService.put<Payment>(`${this.BASE_PATH}/${id}/status`, { status });
    return response.data;
  }

  async processRefund(id: number, reason?: string): Promise<Payment> {
    const response = await apiService.put<Payment>(`${this.BASE_PATH}/${id}/refund`, { reason });
    return response.data;
  }

  // Payment methods and processing
  async getPaymentMethods(): Promise<string[]> {
    const response = await apiService.get<string[]>(`${this.BASE_PATH}/methods`);
    return response.data;
  }

  async processPayment(paymentData: {
    enrollmentId: number;
    paymentMethod: string;
    amount: number;
    paymentDetails: any;
  }): Promise<{
    payment: Payment;
    redirectUrl?: string;
    requiresAction?: boolean;
  }> {
    const response = await apiService.post(`${this.BASE_PATH}/process`, paymentData);
    return response.data;
  }

  async confirmPayment(paymentId: number, confirmationData: any): Promise<Payment> {
    const response = await apiService.post<Payment>(`${this.BASE_PATH}/${paymentId}/confirm`, confirmationData);
    return response.data;
  }

  async cancelPayment(paymentId: number): Promise<Payment> {
    const response = await apiService.put<Payment>(`${this.BASE_PATH}/${paymentId}/cancel`);
    return response.data;
  }

  // Instructor methods
  async getInstructorPayments(pagination?: PaginationParams): Promise<PaginatedResponse<Payment>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Payment>>(`${this.BASE_PATH}/instructor-payments`, params);
    return response.data;
  }

  async getInstructorEarnings(): Promise<{
    totalEarnings: number;
    pendingEarnings: number;
    monthlyEarnings: { month: string; earnings: number }[];
    topCourses: { courseId: number; title: string; earnings: number }[];
  }> {
    const response = await apiService.get(`${this.BASE_PATH}/instructor-earnings`);
    return response.data;
  }

  async requestPayout(amount: number, payoutMethod: string): Promise<{
    id: number;
    amount: number;
    status: string;
    requestDate: string;
  }> {
    const response = await apiService.post(`${this.BASE_PATH}/payout-request`, {
      amount,
      payoutMethod,
    });
    return response.data;
  }

  // Admin methods
  async getAllPayments(pagination?: PaginationParams): Promise<PaginatedResponse<Payment>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Payment>>(`${this.BASE_PATH}/all`, params);
    return response.data;
  }

  async getPaymentStats(): Promise<{
    totalRevenue: number;
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    refundedPayments: number;
    monthlyRevenue: { month: string; revenue: number }[];
    paymentMethodStats: { method: string; count: number; revenue: number }[];
  }> {
    const response = await apiService.get(`${this.BASE_PATH}/stats`);
    return response.data;
  }

  async getRevenueAnalytics(startDate: string, endDate: string): Promise<{
    totalRevenue: number;
    dailyRevenue: { date: string; revenue: number }[];
    courseRevenue: { courseId: number; title: string; revenue: number }[];
    instructorRevenue: { instructorId: number; name: string; revenue: number }[];
  }> {
    const response = await apiService.get(`${this.BASE_PATH}/revenue-analytics`, {
      startDate,
      endDate,
    });
    return response.data;
  }

  // Webhook handling
  async handleWebhook(provider: string, payload: any): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/webhook/${provider}`, payload);
  }

  // Utility methods
  async validatePaymentAmount(enrollmentId: number): Promise<{
    isValid: boolean;
    expectedAmount: number;
    currency: string;
  }> {
    const response = await apiService.get(`${this.BASE_PATH}/validate-amount/${enrollmentId}`);
    return response.data;
  }

  async getPaymentReceipt(paymentId: number): Promise<Blob> {
    const response = await apiService.get(`${this.BASE_PATH}/${paymentId}/receipt`);
    return new Blob([response.data], { type: 'application/pdf' });
  }

  async exportPayments(startDate?: string, endDate?: string): Promise<Blob> {
    const params = { startDate, endDate };
    const response = await apiService.get(`${this.BASE_PATH}/export`, params);
    return new Blob([response.data], { type: 'text/csv' });
  }

  // Payment gateway integration helpers
  async initializeStripePayment(enrollmentId: number): Promise<{
    clientSecret: string;
    publishableKey: string;
  }> {
    const response = await apiService.post(`${this.BASE_PATH}/stripe/initialize`, { enrollmentId });
    return response.data;
  }

  async initializePayPalPayment(enrollmentId: number): Promise<{
    orderId: string;
    approvalUrl: string;
  }> {
    const response = await apiService.post(`${this.BASE_PATH}/paypal/initialize`, { enrollmentId });
    return response.data;
  }
}

export const paymentService = new PaymentService();
export default paymentService;