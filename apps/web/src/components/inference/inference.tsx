import React, { useState, useCallback } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from '@/components/ui/button';

export function EyeSelector({ eyeSide, onEyeSideChange, className }: { eyeSide: 'left' | 'right'; onEyeSideChange: (side: 'left' | 'right') => void; className?: string }) {
  return (
    <ToggleGroup type="single" value={eyeSide} onValueChange={onEyeSideChange} className={`${className} border rounded-lg`}>
      <ToggleGroupItem
        value="left"
        className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Left Eye
      </ToggleGroupItem>
      <ToggleGroupItem
        value="right"
        className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Right Eye
      </ToggleGroupItem>
    </ToggleGroup>
  )
}


interface InferencePresentationProps {
  eyeSide: 'left' | 'right';
  image: string | null;
  onEyeSideChange: (side: 'left' | 'right') => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InferencePresentation: React.FC<InferencePresentationProps> = ({
  eyeSide,
  image,
  onEyeSideChange,
  onImageUpload
}) => {

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Eye Diagnosis</h1>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Column 1: Image Upload and Eye Toggle */}
        <div className="space-y-4">
          <div className="h-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
            {image ? (
              <img 
                src={image} 
                alt="Uploaded eye scan" 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <p className="mb-2">Upload Eye Scan</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onImageUpload}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Diagnostic Information */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="space-y-2">
                <label htmlFor="diagnostic" className="block text-sm font-medium text-gray-700 mb-1">Diagnostic</label>
                <input 
                id="diagnostic" 
                type="text"
                value="" 
                readOnly 
                className="w-full p-2 border rounded bg-gray-100"
                />
            </div>
            
            <div className="space-y-2">
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <input 
                id="stage" 
                type="text"
                value="" 
                readOnly 
                className="w-full p-2 border rounded bg-gray-100"
                />
            </div>
            
            <div className="space-y-2">
                <label htmlFor="imageType" className="block text-sm font-medium text-gray-700 mb-1">Image Type</label>
                <input 
                id="imageType" 
                type="text"
                value="" 
                readOnly 
                className="w-full p-2 border rounded bg-gray-100"
                />
            </div>

            <div className="flex flex-col space-y-2 justify-end">
                <EyeSelector className="mx-2 mt-10" eyeSide={eyeSide} onEyeSideChange={onEyeSideChange} />

                <Button className='w-full' variant={'default'} type='submit'>Submit</Button>
            </div>
          </div>
          
          <div>
            <div className="space-y-2">
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Lesion Summary</label>
                <textarea 
                id="summary" 
                value="" 
                readOnly 
                rows={5}
                className="resize-none w-full p-2 border rounded bg-gray-100"
                />
            </div>
            
            <div className="space-y-2">
                <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                <textarea 
                id="recommendations" 
                value="" 
                readOnly 
                rows={5}
                className="resize-none w-full p-2 border rounded bg-gray-100"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Inference: React.FC = () => {
  const [eyeSide, setEyeSide] = useState<'left' | 'right'>('left');
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <InferencePresentation 
      eyeSide={eyeSide}
      image={image}
      onEyeSideChange={setEyeSide}
      onImageUpload={handleImageUpload}
    />
  );
};

export default Inference;