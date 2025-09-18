import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Edit,
    Trash2,
    Send,
    RefreshCw,
    Download,
    Archive,
    MoreHorizontal
} from 'lucide-react';

interface Supplier {
    id: string;
    name: string;
    status: string;
    // Add other supplier properties as needed
}

interface SupplierProfileActionsProps {
    supplier: Supplier;
    onEdit: () => void;
    onDelete: () => void;
    onSendRFQ: () => void;
    onRequalify: () => void;
    onExport: () => void;
}

export function SupplierProfileActions({
    supplier,
    onEdit,
    onDelete,
    onSendRFQ,
    onRequalify,
    onExport
}: SupplierProfileActionsProps) {
    return (
        <div className="flex items-center gap-2">
            {/* Primary Actions */}
            <Button onClick={onEdit} variant="default">
                <Edit className="w-4 h-4 mr-2" />
                Edit
            </Button>

            <Button onClick={onSendRFQ} variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Send RFQ
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={onRequalify}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Re-qualify Supplier
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={onExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Profile
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={onDelete}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Supplier
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
