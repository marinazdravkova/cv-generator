"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useReactToPrint } from "react-to-print";
import { supabase } from "@/lib/supabaseClient";

const formSchema = z.object({
  firstName: z.string().min(2, "Името мора да има барем 2 букви"),
  lastName: z.string().min(2, "Презимето мора да има барем 2 букви"),
  email: z.string().email("Внесете валидна емаил адреса"),
  //phone: z.string().min(9, "Телефонскиот број мора да има барем 9 цифри"),
  brand: z.string().min(1, "Ве молиме одберете бренд"),
  workTime: z.string().min(1, "Одберете тип на работно време"),
  weeklyHours: z.string().min(1, "Одберете број на часови во неделата"),
  role: z.string().min(1, "Одберете позиција"),
  languages: z.array(z.string()).optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CVForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      workTime: "Full-time",
      weeklyHours: "40",
    },
  });
  const brands = [
    "ZARA",
    "PULL&BEAR",
    "Massimo Dutti",
    "OYSHO",
    "Bershka",
    "STRADIVARIUS",
    "ZARA HOME",
  ];
  const workingHours = ["20", "30", "40"];
  const positions = [
    "Продавач/Касиер",
    "Визуелен комерцијалист",
    "Менаџер на продавница",
    "Останато",
  ];
  const [cvData, setCvData] = useState<FormData | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState<"form" | "preview">("form");
  const cvResultRef = useRef<HTMLDivElement>(null);

  const onSubmit = (data: FormData) => {
    setCvData(data);
    setStep("preview");
  };

  const saveToDatabase = async () => {
    //await new Promise((resolve) => setTimeout(resolve, 5000));
    if (isSaving || !cvData) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("cv_applications").insert([
        {
          first_name: cvData.firstName,
          last_name: cvData.lastName,
          email: cvData.email,
          brand: cvData.brand,
          role: cvData.role,
          work_time: cvData.workTime,
          weekly_hours: cvData.weeklyHours,
          languages: Array.isArray(cvData.languages)
            ? cvData.languages.join(", ")
            : cvData.languages,
          education: cvData.education,
          experience: cvData.experience,
        },
      ]);

      if (error) throw error;

      setShowSuccess(true);
    } catch (error) {
      console.error("Грешка при зачувување: ", error);
      alert("Настана грешка при зачувување");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${cvData ? `${cvData.firstName}_${cvData.lastName}_CV` : "CV"}`,
  });

  return (
    <div className="flex flex-col items-center gap-10 w-full">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Аплицирај за работа
          </h2>
          <p className="text-gray-500 mt-2">
            Пополни ги податоците и генерирај CV.
          </p>
        </div>
        {step === "form" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Име
                </label>
                <input
                  {...register("firstName")}
                  placeholder="Внесете име"
                  className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
                {errors.firstName && (
                  <span className="text-red-500 text-xs">
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Презиме
                </label>
                <input
                  {...register("lastName")}
                  placeholder="Внесете презиме"
                  className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
                {errors.lastName && (
                  <span className="text-red-500 text-xs">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Емаил
              </label>
              <input
                {...register("email")}
                placeholder="емаил@пример.com"
                className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700 italic">
                Одберете бренд:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {brands.map((b) => (
                  <label
                    key={b}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      value={b}
                      {...register("brand")}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-[10px] font-bold uppercase">{b}</span>
                  </label>
                ))}
              </div>
              {errors.brand && (
                <span className="text-red-500 text-xs">
                  {errors.brand.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  Тип на работа:
                </label>
                <div className="space-y-2">
                  {["Full-time", "Part-time"].map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        value={t}
                        {...register("workTime")}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm">
                        {t === "Full-time" ? "Полно" : "Неполно"} време
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  Часови:
                </label>
                <div className="flex gap-2">
                  {workingHours.map((h) => (
                    <label key={h} className="flex-1">
                      <input
                        type="radio"
                        value={h}
                        {...register("weeklyHours")}
                        className="peer hidden"
                      />
                      <div className="flex items-center justify-center p-3 border border-gray-200 rounded-xl cursor-pointer peer-checked:bg-blue-600 peer-checked:text-white transition-all">
                        <span className="font-bold">{h}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700">
                Позиција:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {positions.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      value={p}
                      {...register("role")}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-xs">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                {...register("education")}
                placeholder="Образование"
                className="w-full p-3 border border-gray-200 rounded-xl min-h-[80px] outline-none focus:ring-2 focus:ring-blue-100"
              />
              <textarea
                {...register("experience")}
                placeholder="Работно искуство"
                className="w-full p-3 border border-gray-200 rounded-xl min-h-[80px] outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
            >
              Продолжи понатаму
            </button>
          </form>
        ) : (
          <div className="w-full flex flex-col items-center gap-6 pb-20 animate-in fade-in duration-500">
            <div className="w-full max-w-[210mm] flex justify-start">
              <button
                onClick={() => setStep("form")}
                className="text-sm text-blue-600 hover:text-blue-800 underline transition-all"
              >
                ← Назад кон измени
              </button>
            </div>
            <div className="w-full max-w-[210mm] mx-auto bg-white shadow-2xl p-0">
              <div ref={contentRef} className="p-16 print:p-12">
                <div className="border-b-4 border-blue-600 pb-6 mb-10">
                  <h1 className="text-5xl font-black uppercase text-gray-900 tracking-tighter leading-none">
                    {cvData?.firstName} {cvData?.lastName}
                  </h1>
                  <p className="text-blue-600 font-bold uppercase tracking-[0.2em] text-sm mt-2">
                    {cvData?.role}
                  </p>
                </div>

                <div className="space-y-10">
                  <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-4">
                      Контакт и детали
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-gray-700">
                      <p>
                        <strong>Емаил:</strong> {cvData?.email}
                      </p>
                      <p>
                        <strong>Бренд:</strong> {cvData?.brand}
                      </p>
                      <p>
                        <strong>Ангажман:</strong>{" "}
                        {cvData?.workTime === "Full-time" ? "Полно" : "Неполно"}{" "}
                        работно време ({cvData?.weeklyHours} часа)
                      </p>
                    </div>
                  </section>

                  {cvData?.experience && (
                    <section>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-4">
                        Работно искуство
                      </h3>
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {cvData.experience}
                      </p>
                    </section>
                  )}

                  {cvData?.education && (
                    <section>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-4">
                        Образование
                      </h3>
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {cvData.education}
                      </p>
                    </section>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full max-w-[210mm] flex flex-col gap-3 print:hidden">
              <button
                onClick={() => handlePrint()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.99]"
              >
                Печати CV
              </button>
              <button
                type="button"
                onClick={saveToDatabase}
                disabled={isSaving}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.99] 
          ${isSaving ? "bg-gray-400 cursor-not-allowed text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
              >
                {isSaving ? "Се зачувува..." : "Зачувај во база"}
              </button>
            </div>
            {showSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Успешно!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Вашето CV е успешно зачувано.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Затвори
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isSaving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="animate-spin text-6xl mb-4">📄</div>
          <p className="text-xl font-bold text-gray-800">
            Се испраќа вашето CV...
          </p>
          <p className="text-gray-500">Ве молиме почекајте неколку секунди</p>
        </div>
      )}
    </div>
  );
}
