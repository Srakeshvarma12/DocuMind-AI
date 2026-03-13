import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FilePlus, X, AlertCircle, FileType, File } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ACCEPTED_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
};

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

const icons = {
    pdf: <FileText className="text-red-500" size={32} />,
    docx: <FileType className="text-blue-500" size={32} />,
    txt: <File className="text-gray-400" size={32} />,
};

export default function UploadDropzone({ onUpload, uploading, uploadProgress }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        setError('');
        if (rejectedFiles?.length > 0) {
            const rejError = rejectedFiles[0].errors[0];
            if (rejError.code === 'file-too-large') {
                setError('File is too large. Max size is 25MB.');
            } else if (rejError.code === 'file-invalid-type') {
                setError('Unsupported file type. Please upload PDF, DOCX, or TXT.');
            } else {
                setError(rejError.message);
            }
            return;
        }
        if (acceptedFiles?.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxSize: MAX_SIZE,
        multiple: false,
        disabled: uploading,
    });

    const handleUpload = () => {
        if (selectedFile && onUpload) {
            onUpload(selectedFile);
        }
    };

    const getExt = (name) => name.split('.').pop().toLowerCase();

    return (
        <div className="space-y-8 animate-fade-in">
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-brand-500 bg-brand-50/50 scale-[1.02]' : 'border-gray-200 hover:border-brand-400 hover:bg-gray-50/50'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-300 
              ${isDragActive ? 'bg-brand-100' : 'bg-gray-50'}`}>
                            <Upload size={32} className={isDragActive ? 'text-brand-600' : 'text-gray-400'} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 mb-2">
                                {isDragActive ? 'Drop it like it\'s hot' : 'Click or drag file to upload'}
                            </p>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                                PDF, DOCX, or TXT (Max 25MB). Your documents are encrypted and secure.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl animate-scale-in border-l-4 border-l-brand-600 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand-50 rounded-full blur-3xl opacity-30"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                                {icons[getExt(selectedFile.name)] || <File className="text-gray-400" size={32} />}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 truncate max-w-md">{selectedFile.name}</h3>
                                <p className="text-sm text-gray-400 mt-1 uppercase font-semibold">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {getExt(selectedFile.name)}
                                </p>
                            </div>
                        </div>
                        {!uploading && (
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {!uploading ? (
                        <button
                            onClick={handleUpload}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-base shadow-xl shadow-brand-600/20"
                        >
                            <FilePlus size={20} />
                            Confirm and Upload
                        </button>
                    ) : (
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-brand-600 flex items-center gap-2">
                                    <LoadingSpinner size={16} />
                                    Uploading...
                                </span>
                                <span className="text-gray-400">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-50 rounded-full h-3.5 border border-gray-100 overflow-hidden">
                                <div
                                    className="bg-brand-600 h-full rounded-full transition-all duration-500 ease-out shadow-lg shadow-brand-600/30"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 text-center italic">
                                Please don't close this window while we securely upload your document.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl animate-shake">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
        </div>
    );
}
