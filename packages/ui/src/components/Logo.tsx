import logo from '../assets/logo.png';

export interface LogoProps {
  readonly className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img src={logo} alt="Vessel API" className={className} />
  );
}
