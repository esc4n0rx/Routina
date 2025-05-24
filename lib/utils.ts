import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utilitários para trabalhar com datas no fuso horário de São Paulo
 */

export const TIMEZONE_SP = 'America/Sao_Paulo';

/**
 * Obtém a data atual no fuso horário de São Paulo
 */
export function getSaoPauloNow(): Date {
  return new Date();
}

/**
 * Converte uma data string (YYYY-MM-DD) e opcionalmente um horário (HH:MM) 
 * para um objeto Date no fuso horário de São Paulo
 */
export function createSaoPauloDate(dateString: string, timeString?: string): Date {
  // Parse da data no formato YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Criar data em São Paulo
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  } else {
    // Se não há horário específico, considera o final do dia
    date.setHours(23, 59, 59, 999);
  }
  
  return date;
}

/**
 * Verifica se uma tarefa está vencida baseada na data e horário
 */
export function isTaskOverdue(dateString: string, timeString?: string): boolean {
  const now = getSaoPauloNow();
  const dueDate = createSaoPauloDate(dateString, timeString);
  
  return dueDate < now;
}

/**
 * Formata uma data para exibição no fuso horário de São Paulo
 */
export function formatSaoPauloDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleString('pt-BR', {
    timeZone: TIMEZONE_SP,
    ...options
  });
}

/**
 * Obtém o início do dia para uma data no fuso horário de São Paulo
 */
export function getStartOfDaySP(date?: Date): Date {
  const targetDate = date || getSaoPauloNow();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Obtém o fim do dia para uma data no fuso horário de São Paulo
 */
export function getEndOfDaySP(date?: Date): Date {
  const targetDate = date || getSaoPauloNow();
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * Verifica se duas datas são do mesmo dia no fuso horário de São Paulo
 */
export function isSameDaySP(date1: Date, date2: Date): boolean {
  const d1 = formatSaoPauloDate(date1, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const d2 = formatSaoPauloDate(date2, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return d1 === d2;
}
