import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AccuracyBadgeProps {
    accuracy: number;
}

const AccuracyBadge: React.FC<AccuracyBadgeProps> = ({ accuracy }) => {
    const background = accuracy > 0.9 ? 'bg-green-400' :
                            accuracy >= 0.7 ? 'bg-yellow-400' :
                            accuracy < 0.7 ? 'bg-red-400' :
                            'bg-gray-400';

    return <Badge variant={'secondary'} className={`${background} text-white font-bold text-2xl`}>{accuracy*100} %</Badge>;
}

export default AccuracyBadge;