import { CustomerOrganizationWithSummary } from '@/hooks/useCustomerOrganizations';

export interface CustomerStatistics {
    totalCustomers: number;
    activeCustomers: number;
    archivedCustomers: number;
    countries: number;
    totalProjects: number;
    totalValue: number;
    activeProjects: number;
}

export function calculateCustomerStatistics(customers: CustomerOrganizationWithSummary[]): CustomerStatistics {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.is_active !== false).length;
    const archivedCustomers = customers.filter(c => c.is_active === false).length;
    const countries = [...new Set(customers.map(c => c.country).filter(Boolean))].length;
    const totalProjects = customers.reduce((sum, c) => sum + c.project_summary.total_projects, 0);
    const totalValue = customers.reduce((sum, c) => sum + c.project_summary.total_value, 0);
    const activeProjects = customers.reduce((sum, c) => sum + c.project_summary.active_projects, 0);

    return {
        totalCustomers,
        activeCustomers,
        archivedCustomers,
        countries,
        totalProjects,
        totalValue,
        activeProjects
    };
}
