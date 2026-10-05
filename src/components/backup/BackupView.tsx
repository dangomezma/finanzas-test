import React, { useState } from 'react';
import {
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
  FileCheck2,
  RefreshCw,
  ServerCrash,
} from 'lucide-react';
import { exportDatabaseBackup, importDatabaseBackup } from '../../db/backupService';
import { runAccountingAudit, type AuditTestResult } from '../../core/testing/accountingAudit';

interface BackupViewProps {
  accountsCount: number;
  transactionsCount: number;
  categoriesCount: number;
  onRefreshData: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  accountsCount,
  transactionsCount,
  categoriesCount,
  onRefreshData,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [auditResults, setAuditResults] = useState<ReturnType<typeof runAccountingAudit> | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportDatabaseBackup();
      setStatusMessage({ type: 'success', text: 'Copia de seguridad descargada exitosamente en formato JSON.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error al exportar los datos: ' + (err as Error).message });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoring(true);
      const text = await file.text();
      const res = await importDatabaseBackup(text);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Base de datos restaurada correctamente.' });
        onRefreshData();
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error al leer el archivo: ' + (err as Error).message });
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
  };

  const handleRunAudit = () => {
    const report = runAccountingAudit();
    setAuditResults(report);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Copia de Seguridad y Auditoría del Sistema</span>
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Control total de tus datos. Exporta copias en formato abierto JSON o audita la integridad contable de tu libro mayor.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tarjetas de Exportación e Importación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exportar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
              Exportar Copia de Seguridad
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Descarga un archivo <code>.json</code> con tus cuentas, transacciones, presupuestos, metas y suscripciones. Puedes guardarlo en tu Google Drive, disco duro o enviártelo por correo.
            </p>

            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-xs space-y-1 text-zinc-600 dark:text-zinc-300">
              <p>• {accountsCount} cuentas configuradas</p>
              <p>• {transactionsCount} transacciones en el historial</p>
              <p>• {categoriesCount} categorías registradas</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generando archivo...' : 'Descargar Respaldo JSON'}</span>
          </button>
        </div>

        {/* Restaurar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
              Restaurar Copia de Seguridad
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Carga un archivo <code>.json</code> exportado previamente para reestablecer todo tu historial financiero.
            </p>

            <div className="mt-4 p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <strong>Nota:</strong> Al restaurar un respaldo, los registros actuales se sustituyen de forma atómica por los del archivo.
            </div>
          </div>

          <label className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isRestoring ? 'Restaurando datos...' : 'Seleccionar Archivo JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={isRestoring}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Auditoría y Diagnóstico del Motor Contable */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Auditoría Contable y Estado del Sistema
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Verifica las identidades contables (Activos - Pasivos, amortización de tarjetas, ausencia de errores de coma flotante).
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAudit}
            className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-xs cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ejecutar Test de Auditoría</span>
          </button>
        </div>

        {auditResults && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Resultado: {auditResults.passedCount} de {auditResults.totalTests} pruebas superadas
              </span>
              {auditResults.allPassed ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Consistente y Verificado</span>
                </span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{auditResults.failedCount} fallos detectados</span>
                </span>
              )}
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {auditResults.results.map((r, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        [{r.category}] {r.testName}
                      </span>
                      <span className="block text-[11px] text-zinc-400">
                        Esperado: {r.expected} | Obtenido: {r.actual}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                      r.passed
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {r.passed ? 'PASÓ' : 'FALLÓ'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Privacidad y Filosofía */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-6 flex items-start space-x-4">
        <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
          <h4 className="font-bold text-sm">Privacidad Absoluta Garantizada (Local-First)</h4>
          <p>
            Esta aplicación funciona de manera 100% autónoma en tu navegador a través de IndexedDB (Dexie.js).
            Ningún número de cuenta, saldo ni transacción se envía a servidores externos ni a la nube.
            Al utilizar las copias de seguridad en formato JSON, mantienes la propiedad y soberanía perpetua sobre tus finanzas.
          </p>
        </div>
      </div>
    </div>
  );
};
