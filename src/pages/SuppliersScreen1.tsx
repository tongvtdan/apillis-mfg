import React from 'react';
import { SupplierList } from '@/components/supplier/SupplierList';

export default function SuppliersScreen1() {
    const handleSupplierSelect = (supplier: any) => {
        console.log('View supplier:', supplier);
        // In a real implementation, this would navigate to the supplier detail page
        alert(`Viewing supplier: ${supplier.name}`);
    };

    const handleSendRFQ = (supplier: any) => {
        console.log('Send RFQ to supplier:', supplier);
        // In a real implementation, this would open the RFQ creation modal
        alert(`Sending RFQ to: ${supplier.name}`);
    };

    const handleStartQualification = (supplier: any) => {
        console.log('Start qualification for supplier:', supplier);
        // In a real implementation, this would start the qualification process
        alert(`Starting qualification for: ${supplier.name}`);
    };

    return (
        <div className="p-6 bg-base-100 text-base-content min-h-screen">
            <SupplierList
                onSupplierSelect={handleSupplierSelect}
                onSendRFQ={handleSendRFQ}
                onStartQualification={handleStartQualification}
            />
        </div>
    );
}