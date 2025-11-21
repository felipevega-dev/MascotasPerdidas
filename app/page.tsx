import Image from "next/image";
import Link from "next/link";
import { Button } from "./components/Button";
import { MapPinIcon, BellAlertIcon, PrinterIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
              <span className="block">Lost a pet?</span>
              <span className="block text-primary-600">Let your neighborhood help.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
              PawAlert connects you with neighbors instantly when your pet goes missing.
              Hyper-local alerts, printable posters, and a community that cares.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/report">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-500/30">
                  Report Missing Pet
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Active Alerts
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden -z-10 pointer-events-none opacity-50">
          <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-[20%] w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">How it works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Every second counts when a pet is lost
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BellAlertIcon className="h-8 w-8 text-white" />}
              title="Instant Alerts"
              description="Notify neighbors within a 5km radius immediately after posting."
              color="bg-red-500"
            />
            <FeatureCard
              icon={<MapPinIcon className="h-8 w-8 text-white" />}
              title="Map-First View"
              description="See lost and sighted pets on an interactive map of your area."
              color="bg-blue-500"
            />
            <FeatureCard
              icon={<PrinterIcon className="h-8 w-8 text-white" />}
              title="Instant Posters"
              description="Generate professional PDF flyers with QR codes in one click."
              color="bg-yellow-500"
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="h-8 w-8 text-white" />}
              title="Verified Community"
              description="Safe reward handling and verified sightings to prevent scams."
              color="bg-green-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-extrabold text-primary-600">24h</div>
              <div className="mt-2 text-lg font-medium text-gray-600">Critical Window</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary-600">5km</div>
              <div className="mt-2 text-lg font-medium text-gray-600">Alert Radius</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary-600">100%</div>
              <div className="mt-2 text-lg font-medium text-gray-600">Community Driven</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="relative p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute top-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl ${color} shadow-lg`}>
        {icon}
      </div>
      <div className="pt-16">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
}
