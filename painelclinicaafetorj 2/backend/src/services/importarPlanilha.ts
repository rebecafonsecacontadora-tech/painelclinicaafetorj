import * as XLSX from 'xlsx';
import { ZodSchema } from 'zod';

export interface ResultadoImportacao<T> {
  totalLinhas: number;
  validos: T[];
  erros: { linha: number; erros: string[] }[];
}

/**
 * Lê um arquivo .xlsx/.csv (buffer em memória) e valida cada linha contra o schema Zod informado.
 * `linha` no retorno de erro é 1-indexed e já considera o cabeçalho (linha 1 = primeira linha de dados).
 */
export function lerEValidarPlanilha<T>(
  buffer: Buffer,
  schema: ZodSchema<T>,
): ResultadoImportacao<T> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const primeiraAba = workbook.SheetNames[0];
  const linhas = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[primeiraAba], {
    defval: '',
  });

  const validos: T[] = [];
  const erros: { linha: number; erros: string[] }[] = [];

  linhas.forEach((linhaBruta, indice) => {
    const resultado = schema.safeParse(linhaBruta);
    if (resultado.success) {
      validos.push(resultado.data);
    } else {
      erros.push({
        linha: indice + 1,
        erros: resultado.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
  });

  return { totalLinhas: linhas.length, validos, erros };
}
