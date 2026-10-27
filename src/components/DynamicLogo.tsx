import { useStore } from '../hooks';
import VergeDynamicsLogo from './VergeDynamicsLogo';

export default function DynamicLogo({ className = "w-8 h-8" }: { className?: string }) {
  const state = useStore();
  const { theme } = state;

  if (theme.logoType === 'custom' && theme.customLogo) {
    return (
      <img
        src={theme.customLogo}
        alt="System Logo"
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  return <VergeDynamicsLogo className={className} />;
}
