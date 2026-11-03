"use client";

import { ImagePlus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import {
  isValidProductImageUrl,
  normalizeProductImageUrl,
} from "@/lib/normalize-image-url";

interface ProductImageFieldProps {
  title?: string;
  hint?: string;
  imageUrl?: string;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onChangeUrl: (url: string) => void;
  onRemove: () => void;
}

export function ProductImageField({
  title = "Основная фотография",
  hint,
  imageUrl,
  uploading,
  onUpload,
  onChangeUrl,
  onRemove,
}: ProductImageFieldProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pathHint, setPathHint] = useState<string | null>(null);

  const previewSrc = useMemo(
    () => normalizeProductImageUrl(imageUrl),
    [imageUrl],
  );
  const previewOk = isValidProductImageUrl(previewSrc);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setUploadError("Выберите файл изображения (JPG, PNG, WebP)");
        return;
      }
      setUploadError(null);
      setPathHint(null);
      try {
        await onUpload(file);
      } catch {
        setUploadError("Не удалось загрузить файл");
      }
    },
    [onUpload],
  );

  function commitPathInput() {
    if (!imageUrl?.trim()) {
      setPathHint(null);
      return;
    }
    const normalized = normalizeProductImageUrl(imageUrl);
    if (!normalized) {
      setPathHint(
        "Укажите путь от сайта, например /img/sinabon.png — не папку на диске (C:\\...\\public\\...).",
      );
      return;
    }
    setPathHint(null);
    if (normalized !== imageUrl.trim()) {
      onChangeUrl(normalized);
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <span className="block text-sm font-medium">{title}</span>
      {hint ? <p className="text-xs leading-relaxed text-neutral-500">{hint}</p> : null}
      <p className="text-xs leading-relaxed text-neutral-500">
        «Загрузить фото» сохраняет копию в{" "}
        <span className="font-medium text-neutral-700">/uploads/</span> с уникальным именем.
        Файлы из папки{" "}
        <span className="font-medium text-neutral-700">public/img</span> на сайте указываются как{" "}
        <span className="font-medium text-neutral-700">/img/имя.png</span>.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${
          dragOver
            ? "border-neutral-900 bg-neutral-50"
            : "border-neutral-200 bg-neutral-50/50"
        }`}
      >
        {previewOk && previewSrc ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <Image src={previewSrc} alt="Предпросмотр" fill className="object-cover" unoptimized />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50">
                <Upload className="size-4" aria-hidden />
                Заменить
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => void handleFiles(event.target.files)}
                />
              </label>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" aria-hidden />
                Удалить
              </button>
            </div>
          </div>
        ) : imageUrl?.trim() ? (
          <p className="py-4 text-center text-sm text-amber-800">
            Путь пока некорректный — нажмите Tab или кликните вне поля, чтобы преобразовать в
            /img/…
          </p>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="mb-3 grid size-12 place-items-center rounded-full bg-white text-neutral-500 shadow-sm">
              <ImagePlus className="size-6" aria-hidden />
            </span>
            <p className="text-sm text-neutral-600">
              Перетащите фото сюда или нажмите «Загрузить фото»
            </p>
            <p className="mt-1 text-xs text-neutral-400">JPG, PNG, WebP · до 5 МБ</p>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
              <Upload className="size-4" aria-hidden />
              Загрузить фото
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => void handleFiles(event.target.files)}
              />
            </label>
          </div>
        )}

        {uploading && <p className="mt-2 text-xs text-neutral-500">Загрузка…</p>}
        {uploadError && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {uploadError}
          </p>
        )}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-neutral-500">
          Или путь на сайте (не путь Windows)
        </span>
        <input
          type="text"
          value={imageUrl ?? ""}
          onChange={(event) => {
            setPathHint(null);
            onChangeUrl(event.target.value);
          }}
          onBlur={commitPathInput}
          placeholder="/img/sinabon.png"
          className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm"
        />
        {pathHint ? (
          <p role="alert" className="mt-1.5 text-xs text-red-600">
            {pathHint}
          </p>
        ) : previewOk && previewSrc ? (
          <p className="mt-1.5 text-xs text-neutral-500">Сохранится как: {previewSrc}</p>
        ) : null}
      </label>
    </div>
  );
}
