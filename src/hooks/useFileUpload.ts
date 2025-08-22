import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();

  const uploadFiles = async (files: FileList, rfqId?: string): Promise<UploadedFile[]> => {
    if (!files || files.length === 0) return [];

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Create a unique file path
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}_${randomId}.${fileExt}`;
        const filePath = rfqId ? `${rfqId}/${fileName}` : `temp/${fileName}`;

        const { data, error } = await supabase.storage
          .from('rfq-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        // Update progress
        const progress = ((index + 1) / files.length) * 100;
        setUploadProgress(progress);

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('rfq-attachments')
          .getPublicUrl(filePath);

        return {
          id: randomId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          path: filePath
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      toast({
        title: "Files Uploaded Successfully",
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });

      return uploadedFiles;
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload one or more files. Please try again.",
      });
      return [];
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('rfq-attachments')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "Failed to delete file",
        });
        return false;
      }

      toast({
        title: "File Deleted",
        description: "File deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return {
    uploadFiles,
    deleteFile,
    uploading,
    uploadProgress
  };
}