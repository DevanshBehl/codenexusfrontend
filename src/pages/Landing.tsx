import Navbar from '../components/Landing/Navbar';
import Hero from '../components/Landing/Hero';
import Marquee from '../components/Landing/Marquee';
import FeaturesTabs from '../components/Landing/FeaturesTabs';
import DetailedFeatures from '../components/Landing/DetailedFeatures';
import UnderTheHood from '../components/Landing/UnderTheHood';
import FinalCTA from '../components/Landing/FinalCTA';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-x-hidden">

      {/* Background Dots */}
      <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

      {/* Vertical grid lines */}
      <div className="fixed inset-y-0 left-[5%] xl:left-[10%] w-[1px] bg-[#222] z-0 hidden lg:block opacity-50"></div>
      <div className="fixed inset-y-0 right-[5%] xl:right-[10%] w-[1px] bg-[#222] z-0 hidden lg:block opacity-50"></div>

      {/* Main Content wrapper */}
      <div className="relative z-10 w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto border-x-0 lg:border-x border-[#222] min-h-screen flex flex-col bg-[#050505]/50 backdrop-blur-[1px]">
        <Navbar />
        <Hero />
        <Marquee />
        <FeaturesTabs />
        <DetailedFeatures />
        <Marquee />
        <UnderTheHood />
        <Marquee />
        <FinalCTA />
      </div>
    </div>
  )
}
