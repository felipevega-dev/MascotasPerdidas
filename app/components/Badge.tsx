import { clsx } from 'clsx';

interface BadgeProps {
    status: 'lost' | 'sighted' | 'found';
    className?: string;
}

export const Badge = ({ status, className }: BadgeProps) => {
    const styles = {
        lost: 'bg-red-100 text-red-800 border-red-200',
        sighted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        found: 'bg-green-100 text-green-800 border-green-200',
    };

    const labels = {
        lost: 'Perdido',
        sighted: 'Visto',
        found: 'Encontrado',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                styles[status],
                className
            )}
        >
            {labels[status]}
        </span>
    );
};
