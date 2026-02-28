import LandingHero from '../components/landing/LandingHero';
import LandingWhy from '../components/landing/LandingWhy';
import LandingProcess from '../components/landing/LandingProcess';
import LandingStats from '../components/landing/LandingStats';
import LandingRoles from '../components/landing/LandingRoles';
import LandingCTA from '../components/landing/LandingCTA';
import LandingFooter from '../components/landing/LandingFooter';

export default function Landing() {
    return (
        <div className="bg-white text-gray-800 selection:bg-[#A5D6A7]/40 selection:text-[#1B5E20]">
            <LandingHero />
            <LandingWhy />
            <LandingProcess />
            <LandingStats />
            <LandingRoles />
            <LandingCTA />
            <LandingFooter />
        </div>
    );
}
