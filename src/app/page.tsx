import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertIcon, BasketIcon, BookIcon, LayersIcon, TrendUpIcon } from '@/components/icons'

export const metadata: Metadata = {
  title: { absolute: 'Escandallo · Costeo de recetas' },
  description: 'Registra lo que pagas por cada insumo y sabe al centavo cuánto te cuesta cada receta, cuánto ganas y a cuánto vender.',
  openGraph: {
    title: 'Escandallo · Costeo de recetas',
    description: 'Sabe al centavo cuánto te cuesta cada receta, cuánto ganas y a cuánto vender.',
    type: 'website',
    locale: 'es_MX'
  }
}

const cta = 'inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-brand px-6 text-base font-semibold text-brand-ink transition hover:brightness-110 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
const ctaGhost = 'inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-6 text-base font-semibold text-ink transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

const features = [
  {
    Icon: BasketIcon,
    title: 'Tus insumos, a tu precio',
    text: 'Anota cómo compras cada cosa (1 kg, 30 piezas, 250 g) y cuánto pagas. Escandallo convierte las unidades por ti.'
  },
  {
    Icon: BookIcon,
    title: 'Costo por porción',
    text: 'Arma la receta con cantidades reales y ve el costo total y el de cada porción, pieza o tanda.'
  },
  {
    Icon: TrendUpIcon,
    title: 'Margen y precio sugerido',
    text: 'Escribe tu precio de venta y mira qué % es costo y cuánto ganas. Si te pasas, te dice a cuánto vender.'
  },
  {
    Icon: AlertIcon,
    title: 'Merma incluida',
    text: 'Lo que se pierde al limpiar o cocinar también cuesta. Agrega el % de merma y el costo se ajusta solo.'
  },
  {
    Icon: LayersIcon,
    title: 'Subrecetas',
    text: 'Una salsa, masa o relleno se costea una vez y se usa dentro de otras recetas.'
  },
  {
    Icon: TrendUpIcon,
    title: 'Avisos cuando sube algo',
    text: 'Actualiza un precio y todas las recetas se recalculan. Te avisa qué insumo subió y a cuántas recetas afecta.'
  }
]

const steps = [
  { title: 'Registra tus insumos', text: 'Harina, 1 kg, $32. Huevo, 30 piezas, $95. Lo que compras, como lo compras.' },
  { title: 'Arma tus recetas', text: 'Elige insumos o subrecetas, pon la cantidad y la merma. El costo aparece mientras escribes.' },
  { title: 'Pon tu precio', text: 'Indica cuántas porciones salen y a cuánto vendes. Escandallo te dice si el negocio da.' }
]

const previewItems = [
  { name: 'Mantequilla', detail: '200 g', cost: '$36.00', share: 33, warn: true },
  { name: 'Cacao en polvo', detail: '80 g', cost: '$24.96', share: 23 },
  { name: 'Harina de trigo', detail: '500 g', cost: '$16.00', share: 15 },
  { name: 'Huevo', detail: '4 pz', cost: '$12.67', share: 12 }
]

export default function LandingPage () {
  return (
    <div className='min-h-dvh overflow-x-clip'>
      <header className='sticky top-0 z-20 border-b border-line/60 bg-bg/85 backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-5'>
          <Link href='/' className='flex items-center gap-2.5 font-display text-xl font-bold tracking-tight'>
            <Logo size={32} />
            Escandallo
          </Link>
          <Link href='/login' className='inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-brand transition hover:bg-brand-soft'>
            Entrar
          </Link>
        </div>
      </header>

      <main>
        {/* Portada */}
        <section className='mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-20'>
          <div className='flex flex-col gap-6'>
            <span className='inline-flex w-fit items-center rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-soft-ink'>
              Costeo de recetas
            </span>
            <h1 className='font-display text-[42px] leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl'>
              Sabe cuánto te cuesta cada receta, al centavo.
            </h1>
            <p className='max-w-xl text-lg leading-relaxed text-muted text-pretty'>
              Registra lo que pagas por cada insumo y Escandallo calcula el costo de tus recetas, cuánto ganas por porción y a cuánto te conviene vender.
            </p>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Link href='/login' className={cta}>Empezar con Google</Link>
              <a href='#como-funciona' className={ctaGhost}>Cómo funciona</a>
            </div>
            <p className='text-sm text-muted'>Gratis · Funciona en el navegador y se instala en tu celular</p>
          </div>

          <AppPreview />
        </section>

        {/* Funciones */}
        <section aria-labelledby='features-title' className='border-y border-line bg-surface'>
          <div className='mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20'>
            <div className='flex max-w-2xl flex-col gap-3'>
              <h2 id='features-title' className='font-display text-3xl font-bold tracking-tight sm:text-4xl'>
                Todo lo que entra en el costo, sin hojas de cálculo
              </h2>
              <p className='text-lg text-muted'>Lo que antes te tomaba una tarde con calculadora, ahora se actualiza solo.</p>
            </div>
            <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {features.map(({ Icon, title, text }) => (
                <li key={title} className='flex flex-col gap-3 rounded-3xl border border-line bg-bg p-6'>
                  <span className='flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-ink'>
                    <Icon size={22} />
                  </span>
                  <h3 className='font-display text-lg font-bold'>{title}</h3>
                  <p className='leading-relaxed text-muted'>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id='como-funciona' aria-labelledby='steps-title' className='mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-10 px-5 py-20'>
          <h2 id='steps-title' className='font-display text-3xl font-bold tracking-tight sm:text-4xl'>Cómo funciona</h2>
          <ol className='grid gap-6 md:grid-cols-3'>
            {steps.map((step, index) => (
              <li key={step.title} className='flex flex-col gap-3'>
                <span className='num flex size-10 items-center justify-center rounded-full bg-ink font-display text-lg font-bold text-bg'>{index + 1}</span>
                <h3 className='font-display text-xl font-bold'>{step.title}</h3>
                <p className='leading-relaxed text-muted'>{step.text}</p>
              </li>
            ))}
          </ol>

          {/* La cuenta, explicada */}
          <div className='grid gap-6 rounded-3xl border border-line bg-surface p-6 sm:p-8 md:grid-cols-[1fr_1.2fr] md:items-center'>
            <div className='flex flex-col gap-2'>
              <h3 className='font-display text-2xl font-bold'>La cuenta, a la vista</h3>
              <p className='leading-relaxed text-muted'>
                Nada de números mágicos: cada ingrediente muestra de dónde sale su costo, merma incluida.
              </p>
            </div>
            <div className='num flex flex-col gap-2 rounded-2xl bg-bg p-5 text-[15px]'>
              <div className='flex justify-between gap-4'><span className='text-muted'>Fresa comprada</span><span>1 kg a $60.00</span></div>
              <div className='flex justify-between gap-4'><span className='text-muted'>Usas</span><span>250 g</span></div>
              <div className='flex justify-between gap-4'><span className='text-muted'>Merma (hojas y tallos)</span><span>15%</span></div>
              <div className='flex justify-between gap-4'><span className='text-muted'>Compras en realidad</span><span>294 g</span></div>
              <div className='mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-3'>
                <span className='font-semibold'>Costo del ingrediente</span>
                <span className='font-display text-2xl font-bold text-brand'>$17.65</span>
              </div>
            </div>
          </div>
        </section>

        {/* Instalar */}
        <section aria-labelledby='install-title' className='mx-auto max-w-6xl px-5 pb-20'>
          <div className='grid gap-8 rounded-3xl bg-brand p-8 text-brand-ink sm:p-10 md:grid-cols-[1.2fr_1fr] md:items-center'>
            <div className='flex flex-col gap-3'>
              <h2 id='install-title' className='font-display text-3xl font-bold tracking-tight'>Llévala en el bolsillo</h2>
              <p className='text-lg leading-relaxed opacity-90'>
                Escandallo se instala como una app en tu celular, sin tiendas ni descargas pesadas. Ábrela en la cocina o en el súper cuando cambie un precio.
              </p>
            </div>
            <dl className='flex flex-col gap-4 rounded-2xl bg-black/10 p-5 text-[15px]'>
              <div className='flex flex-col gap-0.5'>
                <dt className='font-semibold'>Android</dt>
                <dd className='opacity-90'>Entra, ve a Cuenta y toca “Instalar app”.</dd>
              </div>
              <div className='flex flex-col gap-0.5'>
                <dt className='font-semibold'>iPhone</dt>
                <dd className='opacity-90'>En Safari, toca Compartir y luego “Agregar a inicio”.</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Llamado final */}
        <section className='mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 pb-24 text-center'>
          <h2 className='font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl'>
            Deja de adivinar tus precios
          </h2>
          <p className='text-lg text-muted'>Entra con tu cuenta de Google y registra tu primera receta en minutos.</p>
          <Link href='/login' className={cta}>Empezar con Google</Link>
        </section>
      </main>

      <footer className='border-t border-line'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center text-sm text-muted sm:flex-row sm:text-left'>
          <span className='flex items-center gap-2'><Logo size={20} /> Escandallo</span>
          <span>Costeo de recetas para cocinas, reposterías y negocios de comida</span>
        </div>
      </footer>
    </div>
  )
}

function Logo ({ size }: { size: number }) {
  return (
    <span aria-hidden='true' className='flex items-center justify-center rounded-[28%] bg-brand text-brand-ink' style={{ width: size, height: size }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.6' strokeLinecap='round'>
        <path d='M6 8h12M6 12h9M6 16h12' />
      </svg>
    </span>
  )
}

// Vista previa ilustrativa del detalle de una receta (datos de ejemplo)
function AppPreview () {
  return (
    <figure className='relative mx-auto w-full max-w-[360px]'>
      <div aria-hidden='true' className='absolute -inset-6 -z-10 rounded-[48px] bg-brand-soft blur-2xl' />
      <div className='rounded-[40px] border border-line bg-bg p-3 shadow-[0_30px_60px_-20px_rgb(23_32_27/0.35)]'>
        <div className='flex flex-col gap-3 rounded-[30px] bg-bg px-4 pt-5 pb-5'>
          <div className='flex items-center justify-between text-xs font-medium text-muted'>
            <span>Postres</span>
            <span>12 porciones</span>
          </div>
          <p className='font-display text-2xl leading-tight font-bold tracking-tight'>Pastel de chocolate</p>

          <div className='flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-4'>
            <div className='flex items-end justify-between'>
              <div className='flex flex-col'>
                <span className='text-[11px] font-medium text-muted'>Costo por porción</span>
                <span className='num font-display text-3xl leading-none font-bold text-brand'>$11.97</span>
              </div>
              <div className='flex flex-col items-end'>
                <span className='text-[11px] font-medium text-muted'>Precio de venta</span>
                <span className='num text-base font-bold'>$35.00</span>
              </div>
            </div>
            <div className='h-2 overflow-hidden rounded-full bg-brand-soft'>
              <div className='h-full w-[34%] rounded-full bg-warn' />
            </div>
            <div className='flex justify-between text-xs'>
              <span><strong className='num text-warn'>34%</strong> <span className='text-muted'>es costo</span></span>
              <span><span className='text-muted'>Ganas</span> <strong className='num'>$23.03</strong></span>
            </div>
          </div>

          <ul className='overflow-hidden rounded-[18px] border border-line bg-surface'>
            {previewItems.map(item => (
              <li key={item.name} className='flex flex-col gap-1.5 border-b border-line-soft px-3.5 py-2.5 last:border-b-0'>
                <div className='flex justify-between text-sm'>
                  <span className='font-semibold'>{item.name} <span className='font-normal text-muted'>· {item.detail}</span></span>
                  <span className='num font-bold'>{item.cost}</span>
                </div>
                <div className='h-1 rounded-full bg-surface-2'>
                  <div className={`h-1 rounded-full ${item.warn === true ? 'bg-warn' : 'bg-brand'}`} style={{ width: `${item.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className='mt-4 text-center text-sm text-muted'>Ejemplo del detalle de una receta</figcaption>
    </figure>
  )
}
