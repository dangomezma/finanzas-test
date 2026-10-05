# Finanzas Personales Local (COP) 🇨🇴💰

Aplicación web progresiva, moderna y privada para la **gestión integral de finanzas personales en pesos colombianos (COP)**. Diseñada bajo la filosofía **Local-First**, garantiza que el 100% de tus datos financieros permanezcan en tu propio dispositivo sin depender de servidores remotos ni intermediarios en la nube.

---

## 🎯 Filosofía y Principios de Diseño

1. **Privacidad Absoluta (Local-First)**: Tus cuentas, transacciones y saldos nunca salen de tu navegador. Se almacenan de forma local y persistente en **IndexedDB**.
2. **Precisión Matemática y Contable**: Todo cálculo monetario se realiza en números enteros en centavos (`amountInCents`), erradicando de raíz los errores de redondeo de punto flotante (`0.1 + 0.2`).
3. **Identidad Contable Rigurosa**:
   $$\text{Patrimonio Neto} = \text{Total Activos (Efectivo + Cuentas + Inversiones)} - \text{Total Pasivos (Deuda Tarjetas de Crédito)}$$
4. **Tratamiento Especializado de Tarjetas de Crédito**: Las tarjetas de crédito no se tratan como cuentas corrientes: manejan cupo total, cupo disponible y deuda actual. Los abonos a la tarjeta transfieren liquidez para amortizar la deuda sin duplicar gastos.
5. **Contexto Colombiano**: Formato nativo en pesos colombianos (`$ 1.500.000 COP`), soporte para plataformas financieras locales (*Bancolombia*, *Nequi*, *Daviplata*, *Efectivo*, etc.) y categorías comunes del entorno del país.

---

## 🚀 Características Principales

### 1. Dashboard Integral
- **Tarjetas de KPI**: Patrimonio Neto consolidado, Dinero Líquido Disponible, Ingresos del Mes, Gastos del Mes y Tasa de Ahorro (`%`).
- **Flujo de Caja Interactivo**: Gráfico de barras comparativo de Ingresos vs. Gastos de los últimos 6 meses.
- **Distribución de Gastos por Categoría (Recharts)**: Gráfico circular interactivo tipo *Donut* con el total del mes y desglose porcentual.
- **Widget de Próximos Pagos**: Calendario rápido de vencimientos recurrentes del mes.

### 2. Cuentas y Tarjetas de Crédito
- Cuentas de Ahorros, Corrientes, Billeteras Digitales (*Nequi*, *Daviplata*), Efectivo e Inversiones.
- **Tarjetas de Crédito**:
  - Cupo total otorgado, cupo disponible y deuda acumulada.
  - Fechas de corte y límites de pago.
  - Botón **"Pagar Tarjeta"** en un solo clic que genera el pago directo reduciendo la deuda sin inflar el total de gastos.

### 3. Registro y Gestión de Transacciones
- Tipos de movimiento: **Gasto**, **Ingreso**, **Transferencia entre Cuentas** y **Pago de Tarjeta (TC)**.
- Filtro multicriterio dinámico:
  - Rango de fechas (desde / hasta).
  - Cuenta de origen o destino.
  - Categoría y subcategoría.
  - Tipo de transacción.
  - Búsqueda en tiempo real por texto (descripción y notas).

### 4. Presupuestos Mensuales
- Fijación de límites de gasto mensuales por categoría.
- Navegación hacia meses pasados o futuros.
- Alertas visuales dinámicas:
  - Normal ($< 80\%$)
  - Advertencia ($80\% - 99\%$)
  - Alerta de sobrecosto con monto excedido ($\ge 100\%$)

### 5. Metas Financieras y Ahorro
- Creación de objetivos a corto, mediano y largo plazo (*Fondo de Emergencia*, *Renovación de Computador*, *Vacaciones*, etc.).
- Cálculo automático de la **cuota mensual sugerida** en función de la fecha límite fijada.
- Acción rápida **"Ajustar Fondos"** para abonar o retirar ahorros directamente.

### 6. Gastos Recurrentes y Suscripciones
- Programación de servicios periódicos (*Arriendo*, *Internet*, *Netflix*, *Gimnasio*, etc.).
- Detección automática del estado: **Pagado este mes**, **Vence hoy**, **Vence en X días** o **Vencido**.
- Botón **"Pagar Ahora"** en un clic que registra la transacción en el libro contable y descuenta el saldo de la cuenta asociada.

### 7. Reportes y Analítica Avanzada
- Gráfico comparativo de flujo mensual (*BarChart*).
- Gráfico de **Evolución del Patrimonio Neto** (*AreaChart* con curva suave).
- Gráfico **Donut de Distribución de Gastos** (*PieChart*).
- Promedios de gasto por transacción y métricas acumuladas.

### 8. Respaldo, Restauración y Auditoría Contable
- **Exportación en JSON**: Descarga tu archivo de respaldo completo en un clic.
- **Restauración Atómica**: Carga un archivo `.json` previo para recuperar tu historial íntegro.
- **Auditoría Contable del Sistema**: Suite de pruebas y validaciones matemáticas ejecutables en tiempo real para verificar la coherencia del balance y la aritmética sin errores.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler y Servidor**: [Vite](https://vite.dev/)
- **Base de Datos Local**: [Dexie.js](https://dexie.com/) (Wrapper reactivo de alto rendimiento para **IndexedDB**)
- **Estilos y Diseño**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualización y Gráficos**: [Recharts](https://recharts.org/)
- **Iconografía**: [Lucide React](https://lucide.dev/)

---

## 💻 Instalación y Uso Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- `npm` o `pnpm` / `yarn`

### Pasos de ejecución:

1. **Clonar o descargar el proyecto**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd finanzas-personales-local-cop
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

5. **Verificación de tipos y linting**:
   ```bash
   npm run lint
   ```

---

## 🔒 Privacidad y Almacenamiento

- Los datos se guardan exclusivamente en el almacenamiento local del navegador (`IndexedDB`).
- No requiere cuentas de usuario externas, contraseñas en servidores remotos ni conexión a internet permanente.
- Se recomienda realizar copias de seguridad periódicas mediante el botón **"Descargar Respaldo JSON"** en la sección **Copia de Seguridad**.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia [Apache 2.0](LICENSE).
