# Global Invoice — Web UI

Frontend Angular 19 + Angular Material de la prueba tecnica **Global-Invoice** (Davivienda).
Consume la API REST del backend (`global-invoices-kata-mngr`): auth JWT, RBAC Operador/Auditor,
motor de tributacion, dashboard y total en letras.

## Stack

| | |
|---|---|
| Framework | Angular 19 (standalone APIs, sin NgModules) |
| UI | Angular Material (tema `rose-red`) |
| Estado | RxJS (`BehaviorSubject`) |
| Graficas | Chart.js + ng2-charts (dashboard, incremento F4) |
| Tests | Jest (`jest-preset-angular`) |
| Hosting | Netlify (build estatico) |

## Requisitos

- Node 20+, npm 10+
- El backend corriendo (local en `http://localhost:8080` o el desplegado en Render)

## Configuracion

La URL del backend **no** se lee en runtime: se hornea en el build desde
`src/environments/`.

| Entorno | Archivo | `apiBaseUrl` |
|---|---|---|
| Desarrollo | `environment.ts` | `http://localhost:8080/api/v1` |
| Produccion | `environment.prod.ts` | URL publica del backend en Render |

El build de produccion sustituye `environment.ts` por `environment.prod.ts`
(`fileReplacements` en `angular.json`). Si cambia la URL de Render, hay que actualizar
`environment.prod.ts` y redesplegar.

## Ejecutar

```bash
npm install
npm start            # ng serve -> http://localhost:4200
```

Para probar contra un backend local, arranca el backend con el perfil `dev` y CORS
permitiendo `http://localhost:4200`.

## Build y tests

```bash
npm run build          # build de produccion -> dist/global-invoices-kata-web-ui/browser
npm test               # jest (una pasada)
npm run test:watch     # jest en modo watch
npm run test:coverage  # jest con reporte de cobertura -> coverage/
```

## Arquitectura

```
src/app/
  core/          servicios transversales: auth (AuthService, interceptor JWT), modelos
  features/      vistas por dominio: auth/login, home, (facturas y dashboard en F2-F4)
  shared/        componentes reutilizables (Atomic Design: atoms/molecules/organisms/templates)
                 y paginas de estado (403, 404)
```

- **AuthService** (`core/auth`): login/logout, token en `localStorage`, decodifica el JWT
  para exponer email + rol via `user$` (`BehaviorSubject`), valida expiracion.
- **Interceptor** (`core/auth/auth.interceptor.ts`): adjunta `Authorization: Bearer` a las
  llamadas del API; ante 401 cierra sesion y redirige a `/login`; ante 403 redirige a `/forbidden`.
- **Ruteo**: rutas limpias (sin `useHash`). El archivo `public/_redirects` (`/* /index.html 200`)
  evita el 404 de Netlify al recargar en una ruta profunda.

## Flujo de ramas

- `main` — protegida. Solo recibe merges via Pull Request con el pipeline de CI en verde.
- `feature/f*` — una rama por incremento del roadmap (seccion 13 del plan). Cada incremento
  = un commit aprobado = un PR.

## Roadmap (frontend)

- [x] **F0** — Bootstrap: auth base (AuthService + interceptor), environments, ruteo limpio
  + `_redirects`, shell con toolbar, login funcional contra el backend real.
- [x] **F1** — Guards `authGuard` / `roleGuard` / `guestGuard`, rutas `/invoices` (OPERADOR) y
  `/dashboard` (AUDITOR), redireccion post-login segun rol (u `?redirect=`), nav del toolbar por rol.
- [x] **F2** — Formulario reactivo `/invoices/new` (RF-02): `addControl`/`removeControl` de
  `customsCode` segun el tipo (nunca `display:none`), `InvoiceService.create` -> `POST /invoices`,
  muestra los totales calculados, mapea los errores 400 del backend a los controles.
- [x] **F3** — Listado `/invoices` (mat-table + paginacion + filtro por tipo, ambos roles) y
  detalle `/invoices/:id` con totales + total en letras (`amountInWords`) y fallback si el SOAP
  no resolvio. Nav "Facturas" para ambos roles; "Nueva factura" solo OPERADOR.
- [ ] F4 — Dashboard reactivo agrupado por tipo (RF-04).
- [ ] F5 — CI (GitHub Actions) + despliegue en Netlify.
