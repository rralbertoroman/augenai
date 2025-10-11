import React from 'react'
import AccuracyBadge from '@/components/model/model-components/accuracy-badge'
import type { Model } from '@augenai/types';
import { Target } from 'lucide-react';

interface ModelScorecardPresentationProps {
    model: Model
}

const ModelScorecardPresentation: React.FC<ModelScorecardPresentationProps> = ({ model }) => {
    const formattedDate = new Date(model.latestTraining).toLocaleDateString();
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Model Scorecard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">{model.modelName}</h2>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">TASKS</h3>
                        <p className="mt-1">{model.modelTasks.join(', ')}</p>
                    </div>
                    
                    <div className="overflow-y-auto max-h-64">
                        <h3 className="text-sm font-medium text-gray-500">DISEASES</h3>
                        <div className="mt-1 space-y-1">
                            {model.diseases.map((disease, index) => (
                                <div key={index}>
                                    <p className="flex items-center"><Target className='mr-2' /> {disease.name}</p>
                                    <p className="ml-8 text-sm text-gray-600">Stages: {disease.stages.join('/')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">ACCEPTED IMAGE TYPES</h3>
                        <p className="mt-1">{model.acceptedImageTypes.join(', ')}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">LATEST TRAINING</h3>
                        <p className="mt-1">{formattedDate}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">ACCURACY</h3>
                            <div className="mt-1">
                                <AccuracyBadge accuracy={model.accuracy} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <button 
                            onClick={() => {
                                // TODO: Implement navigation to model details
                                console.log('Learn more clicked');
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            Learn more about this model →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const ModelScorecard: React.FC = () => {
    const model:Model = {
        modelName: 'DiabeticRetinopathyClassifier',
        modelTasks: ['image-classification'],
        diseases: [{
            name: 'Diabetic Retinopathy',
            stages: ['R0', 'R1', 'R2', 'R3', 'R4']
        },{
            name: 'Age-Related Macular Degeneration',
            stages: ['M0', 'M1', 'M2']
        },],
        acceptedImageTypes: ['OCT', 'Fundus'],
        latestTraining: '2023-05-24',
        accuracy: 0.87,

    }

    return <ModelScorecardPresentation model={model}/>;
}