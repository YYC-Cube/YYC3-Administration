import {
  Check, ChevronRight, Database, Download, FileJson,
  FileSpreadsheet, Loader2, Shield, Sparkles, X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  type ExportableDataset, exportableDatasets, exportToCSV,
  exportToJSON,
} from "./app-context";
import { useI18n } from "./i18n-context";

// ==========================================
// YYC³ 数据导出弹窗 — Data Export Modal
// Cyberpunk-themed export dialog with format
// selection, data preview, and download anim
// ==========================================

interface DataExportModalProps {
  open: boolean;
  onClose: () => void;
  preselectedDataset?: string;
}

type ExportFormat = "csv" | "json";

/**
 * Data export modal dialog.
 * Allows users to select a dataset (dashboard/customers/calls), choose
 * an export format (CSV/JSON), preview data, and trigger file download.
 *
 * @param open - Whether the modal is currently visible.
 * @param onClose - Callback to close the modal.
 * @param preselectedDataset - Optional dataset ID to pre-select.
 */
export function DataExportModal({ open, onClose, preselectedDataset }: DataExportModalProps) {
  const { t } = useI18n();
  const [selectedDataset, setSelectedDataset] = useState<string | null>(preselectedDataset ?? null);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (preselectedDataset) setSelectedDataset(preselectedDataset);
  }, [preselectedDataset]);

  useEffect(() => {
    if (!open) {
      // Reset on close
      setTimeout(() => {
        setIsExporting(false);
        setExportDone(false);
        setShowPreview(false);
      }, 300);
    }
  }, [open]);

  // Keyboard: Esc to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const dataset = exportableDatasets.find(d => d.id === selectedDataset);

  const handleExport = useCallback(() => {
    if (!dataset) return;
    setIsExporting(true);

    // Simulate brief export processing time
    setTimeout(() => {
      const data = dataset.getData();
      const filename = `yyc3_${dataset.id}_${new Date().toISOString().slice(0, 10)}`;

      if (format === "csv") {
        exportToCSV(data, filename);
      } else {
        exportToJSON(data, filename);
      }

      setIsExporting(false);
      setExportDone(true);

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1800);
    }, 1200);
  }, [dataset, format, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center"
      style={{ animation: "fade-in 0.2s ease-out both" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-[92vw] max-w-2xl rounded-2xl border overflow-hidden"
        style={{
          background: "rgba(10,10,10,0.96)",
          borderColor: "rgba(0,240,255,0.3)",
          boxShadow: "0 0 40px rgba(0,240,255,0.15), 0 0 80px rgba(0,240,255,0.05), inset 0 0 30px rgba(0,0,0,0.5)",
          backdropFilter: "blur(20px)",
          animation: "spring-in 0.4s var(--spring-easing) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative bar */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, #00f0ff, #00d4ff, #00ffcc)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.15))",
                border: "1px solid rgba(0,240,255,0.3)",
                boxShadow: "0 0 12px rgba(0,240,255,0.2)",
              }}
            >
              <Download className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div>
              <h3 className="text-white/85 tracking-wider">{t("export.title")}</h3>
              <p className="text-[10px] text-white/25 tracking-wider">{t("export.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-white/25 hover:text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Export success state */}
          {exportDone ? (
            <div className="flex flex-col items-center justify-center py-10" style={{ animation: "spring-in 0.4s var(--spring-easing) both" }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "rgba(0,255,200,0.12)",
                  border: "1px solid rgba(0,255,200,0.4)",
                  boxShadow: "0 0 30px rgba(0,255,200,0.25)",
                  animation: "data-pulse-ring 1.5s ease-out infinite",
                }}
              >
                <Check className="w-8 h-8 text-[#00ffc8]" />
              </div>
              <h4 className="text-[#00ffc8] mb-1 tracking-wider" style={{ textShadow: "0 0 10px rgba(0,255,200,0.4)" }}>
                {t("export.success")}
              </h4>
              <p className="text-xs text-white/30">
                {t("export.fileDownloaded", { label: dataset?.label || "", format: format.toUpperCase() })}
              </p>
            </div>
          ) : isExporting ? (
            /* Exporting state */
            <div className="flex flex-col items-center justify-center py-10" style={{ animation: "spring-in 0.3s var(--spring-easing) both" }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "rgba(0,240,255,0.08)",
                  border: "1px solid rgba(0,240,255,0.3)",
                  boxShadow: "0 0 20px rgba(0,240,255,0.15)",
                }}
              >
                <Loader2 className="w-7 h-7 text-[#00f0ff]" style={{ animation: "icon-spin 1s linear infinite" }} />
              </div>
              <h4 className="text-[#00f0ff] mb-2 tracking-wider" style={{ textShadow: "0 0 10px rgba(0,240,255,0.4)" }}>
                {t("export.exporting")}
              </h4>
              <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #00f0ff, #00d4ff)",
                    animation: "export-progress 1.2s ease-out forwards",
                    boxShadow: "0 0 8px rgba(0,240,255,0.5)",
                  }}
                />
              </div>
              <p className="text-[10px] text-white/20 mt-2">
                {t("export.processing", { rows: dataset?.rowCount || 0, fields: dataset?.fields.length || 0 })}
              </p>
            </div>
          ) : (
            /* Normal selection state */
            <div className="contents">
              {/* Dataset Selection */}
              <div className="mb-5">
                <p className="text-[10px] text-white/25 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-3 h-3" /> {t("export.selectSource")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {exportableDatasets.map(ds => {
                    const isActive = selectedDataset === ds.id;
                    return (
                      <button
                        key={ds.id}
                        onClick={() => { setSelectedDataset(ds.id); setShowPreview(false); }}
                        className="text-left rounded-xl p-4 border transition-all duration-300"
                        style={{
                          background: isActive ? `${ds.color}10` : "rgba(10,10,10,0.5)",
                          borderColor: isActive ? `${ds.color}50` : "rgba(255,255,255,0.04)",
                          boxShadow: isActive ? `0 0 15px ${ds.color}20, inset 0 0 10px ${ds.color}08` : "none",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: isActive ? ds.color : `${ds.color}40`,
                              boxShadow: isActive ? `0 0 6px ${ds.color}` : "none",
                            }}
                          />
                          <span className="text-sm" style={{ color: isActive ? ds.color : "rgba(255,255,255,0.5)" }}>
                            {ds.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/20 mb-2">{ds.description}</p>
                        <div className="flex items-center gap-3 text-[9px] text-white/15">
                          <span>{ds.rowCount} 行</span>
                          <span>{ds.fields.length} 字段</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-5">
                <p className="text-[10px] text-white/25 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <FileJson className="w-3 h-3" /> {t("export.formatLabel")}
                </p>
                <div className="flex gap-3">
                  {([
                    { id: "csv" as ExportFormat, label: "CSV", icon: FileSpreadsheet, desc: t("export.csvDesc"), color: "#00ffc8" },
                    { id: "json" as ExportFormat, label: "JSON", icon: FileJson, desc: t("export.jsonDesc"), color: "#00f0ff" },
                  ]).map(f => {
                    const Icon = f.icon;
                    const isActive = format === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className="flex-1 flex items-center gap-3 p-3 rounded-xl border transition-all duration-300"
                        style={{
                          background: isActive ? `${f.color}10` : "rgba(10,10,10,0.5)",
                          borderColor: isActive ? `${f.color}40` : "rgba(255,255,255,0.04)",
                          boxShadow: isActive ? `0 0 10px ${f.color}15` : "none",
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: isActive ? f.color : "rgba(255,255,255,0.2)" }} />
                        <div>
                          <p className="text-sm" style={{ color: isActive ? f.color : "rgba(255,255,255,0.4)" }}>{f.label}</p>
                          <p className="text-[9px] text-white/15">{f.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Preview */}
              {dataset && (
                <div className="mb-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-[10px] text-white/25 hover:text-white/40 transition-colors mb-3"
                  >
                    <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${showPreview ? "rotate-90" : ""}`} />
                    {t("export.preview")} · {dataset.fields.join(" / ")}
                  </button>
                  {showPreview && (
                    <div
                      className="rounded-xl border overflow-hidden"
                      style={{
                        background: "rgba(10,10,10,0.6)",
                        borderColor: "rgba(255,255,255,0.04)",
                        animation: "spring-in 0.3s var(--spring-easing) both",
                      }}
                    >
                      <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr>
                              {dataset.fields.map(f => (
                                <th
                                  key={f}
                                  className="px-3 py-2 text-left whitespace-nowrap"
                                  style={{ color: `${dataset.color}70`, borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                                >
                                  {f}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dataset.getData().slice(0, 3).map((row, i) => (
                              <tr key={i}>
                                {dataset.fields.map(f => (
                                  <td
                                    key={f}
                                    className="px-3 py-2 text-white/30 whitespace-nowrap"
                                    style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}
                                  >
                                    {String(row[f] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-3 py-1.5 text-[9px] text-white/10 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                        {t("export.showFirst", { n: 3, total: dataset.rowCount })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!exportDone && !isExporting && (
          <div
            className="px-6 py-4 flex items-center justify-between border-t"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center gap-2 text-[9px] text-white/15">
              <Shield className="w-3 h-3" />
              {t("export.localOnly")}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedDataset}
                className="px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all duration-300"
                style={{
                  background: selectedDataset
                    ? "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,255,204,0.15))"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedDataset ? "rgba(0,240,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: selectedDataset ? "#00f0ff" : "rgba(255,255,255,0.15)",
                  boxShadow: selectedDataset ? "0 0 12px rgba(0,240,255,0.15)" : "none",
                  cursor: selectedDataset ? "pointer" : "not-allowed",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                {t("export.exportFormat", { format: format.toUpperCase() })}
              </button>
            </div>
          </div>
        )}

        {/* Bottom decorative line */}
        <div className="h-0.5" style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.3), rgba(0,212,255,0.3), transparent)" }} />
      </div>
    </div>
  );
}