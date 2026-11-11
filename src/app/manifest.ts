import type { MetadataRoute } from 'next'

export default function manifest (): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Escandallo',
    short_name: 'Escandallo',
    description: 'Calcula el costo de tus recetas a partir de lo que pagas por cada insumo.',
    lang: 'es',
    start_url: '/recetas',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F5F6F2',
    theme_color: '#1E5B43',
    categories: ['food', 'business', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ],
    shortcuts: [
      { name: 'Recetas', url: '/recetas', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Insumos', url: '/insumos', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] }
    ]
  }
}
