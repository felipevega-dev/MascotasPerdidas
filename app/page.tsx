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
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
                <Image
                  src="/logo.png"
                  alt="PawAlert Logo"
                  fill
                  className="object-contain rounded-full shadow-lg"
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
              <span className="block">¿Perdiste a tu mascota?</span>
              <span className="block text-primary-600">Deja que tu vecindario ayude.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
              PawAlert te conecta con tus vecinos instantáneamente cuando tu mascota se pierde.
              Alertas hiperlocales, carteles imprimibles y una comunidad que se preocupa.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/report">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-500/30">
                  Reportar Mascota Perdida
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver Alertas Activas
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
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Cómo funciona</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Cada segundo cuenta cuando una mascota se pierde
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BellAlertIcon className="h-8 w-8 text-white" />}
              title="Alertas Instantáneas"
              description="Notifica a los vecinos en un radio de 5km inmediatamente después de publicar."
              color="bg-red-500"
            />
            <FeatureCard
              icon={<MapPinIcon className="h-8 w-8 text-white" />}
              title="Vista de Mapa"
              description="Mira mascotas perdidas y avistamientos en un mapa interactivo de tu área."
              color="bg-blue-500"
            />
            <FeatureCard
              icon={<PrinterIcon className="h-8 w-8 text-white" />}
              title="Carteles Instantáneos"
              description="Genera volantes PDF profesionales con códigos QR en un clic."
              color="bg-yellow-500"
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="h-8 w-8 text-white" />}
              title="Comunidad Verificada"
              description="Manejo seguro de recompensas y avistamientos verificados para evitar estafas."
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
              <div className="mt-2 text-lg font-medium text-gray-600">Ventana Crítica</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary-600">5km</div>
              <div className="mt-2 text-lg font-medium text-gray-600">Radio de Alerta</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary-600">100%</div>
              <div className="mt-2 text-lg font-medium text-gray-600">Impulsado por la Comunidad</div>
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
