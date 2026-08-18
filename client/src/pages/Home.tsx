/**
 * Cartografia Clínica: painel de consulta inspirado em um atlas territorial, no qual filtros e resultados formam um percurso claro.
 */
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import vagasData from "@/data/vagas.json";
import {
  ArrowDownToLine,
  Cross,
  FilterX,
  MapPin,
  Search,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";

type Vaga = {
  id: string;
  cargo: string;
  municipio: string;
  regiaoSaude: string;
  amplaConcorrencia: number;
  negros: number;
  pcd: number;
  indigenas: number;
  quilombolas: number;
  total: number;
};

const vagas = vagasData as Vaga[];
const sourcePdf = "/manus-storage/edital-consolidado-13.08_33996284.pdf";

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export default function Home() {
  const [cargoQuery, setCargoQuery] = useState("");
  const [municipio, setMunicipio] = useState("todos");
  const [regiao, setRegiao] = useState("todas");

  const cargos = useMemo(
    () => Array.from(new Set(vagas.map((vaga) => vaga.cargo))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    []
  );
  const municipios = useMemo(
    () => Array.from(new Set(vagas.map((vaga) => vaga.municipio))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    []
  );
  const regioes = useMemo(
    () => Array.from(new Set(vagas.map((vaga) => vaga.regiaoSaude))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    []
  );

  const resultados = useMemo(() => {
    const normalizado = cargoQuery.trim().toLocaleLowerCase("pt-BR");
    return vagas.filter((vaga) => {
      const correspondeCargo = !normalizado || vaga.cargo.toLocaleLowerCase("pt-BR").includes(normalizado);
      const correspondeMunicipio = municipio === "todos" || vaga.municipio === municipio;
      const correspondeRegiao = regiao === "todas" || vaga.regiaoSaude === regiao;
      return correspondeCargo && correspondeMunicipio && correspondeRegiao;
    });
  }, [cargoQuery, municipio, regiao]);

  const resumo = useMemo(() => {
    return {
      vagas: resultados.reduce((acumulado, vaga) => acumulado + vaga.total, 0),
      cargos: new Set(resultados.map((vaga) => vaga.cargo)).size,
      municipios: new Set(resultados.map((vaga) => vaga.municipio)).size,
    };
  }, [resultados]);

  const resultadosAgrupados = useMemo(() => {
    return resultados.reduce<Record<string, Vaga[]>>((grupos, vaga) => {
      (grupos[vaga.regiaoSaude] ||= []).push(vaga);
      return grupos;
    }, {});
  }, [resultados]);

  const limparFiltros = () => {
    setCargoQuery("");
    setMunicipio("todos");
    setRegiao("todas");
  };

  const exportarCsv = () => {
    const cabecalho = ["Cargo", "Município", "Região de saúde", "Ampla concorrência", "Negros", "PcD", "Indígenas", "Quilombolas", "Total"];
    const linhas = resultados.map((vaga) => [
      vaga.cargo,
      vaga.municipio,
      vaga.regiaoSaude,
      vaga.amplaConcorrencia,
      vaga.negros,
      vaga.pcd,
      vaga.indigenas,
      vaga.quilombolas,
      vaga.total,
    ]);
    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const arquivo = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vagas-ses-2026-filtradas.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="border-b border-[#d9a63a]/20 bg-[#06293a] text-[#fffdf5]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
          <a href="#consulta" className="flex items-center gap-3" aria-label="Ir para a consulta de vagas">
            <img src="/manus-storage/ses-rota-logo_1c9a796d.png" alt="Símbolo Rota SES" className="h-14 w-14 rounded-2xl object-contain sm:h-16 sm:w-16" />
            <span className="leading-none">
              <strong className="display-font block text-xl leading-none tracking-tight text-[#fffdf5]">ROTA SES <span className="font-sans text-xs font-bold tracking-[0.2em] text-[#d9a63a]">2026</span></strong>
              <span className="mt-1.5 block text-[0.66rem] font-semibold tracking-[0.12em] text-[#d7e8e8]/75 uppercase">guia territorial de vagas</span>
            </span>
          </a>
          <div className="hidden text-right sm:block"><span className="micro-label text-[#d9a63a]">Coordenada da consulta</span><span className="mt-1 flex items-center justify-end gap-2 text-xs font-semibold text-[#d7e8e8]/75"><span className="h-2 w-2 rounded-full bg-[#43bfc4]" /> Dados do edital consolidado</span></div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[#06293a] text-[#fffdf5]">
          <img
            src="/manus-storage/ses-hero-cartografia-clinica_1453045e.png"
            alt="Ilustração abstrata de trajetos e territórios de saúde"
            className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-right opacity-80"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06293a] via-[#06293a]/95 to-[#06293a]/35" />
          <div className="atlas-grid absolute inset-0 -z-10 opacity-20" />
          <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-3 text-[#e5b951]">
                <span className="h-2.5 w-2.5 rounded-full bg-current ring-4 ring-[#d9a63a]/15" />
                <span className="h-px w-9 bg-current" />
                <span className="micro-label">Anexo II · Quadro de vagas · 08°S 48°W</span>
              </div>
              <h1 className="display-font text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
                Vagas organizadas para você encontrar o seu próximo território.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#d7e8e8] sm:text-lg">
                Consulte o concurso SES 2026 por <strong className="font-semibold text-white">cargo</strong>, <strong className="font-semibold text-white">município</strong> ou <strong className="font-semibold text-white">região de saúde</strong>. Os filtros se combinam e atualizam os totais em tempo real.
              </p>
              <a href="#consulta" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#d9a63a] px-5 py-3 text-sm font-bold text-[#06293a] transition duration-150 hover:-translate-y-0.5 hover:bg-[#ecc76a] active:scale-[0.97]">
                Explorar vagas <ArrowDownToLine className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="route-line absolute bottom-0 left-0 h-px w-full" />
        </section>

        <section id="consulta" className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#d9a63a] ring-4 ring-[#d9a63a]/15" /><span className="micro-label text-[#a46f11]">Painel de consulta · rota ativa</span><span className="h-px w-10 bg-[#d9a63a]/60" /></div>
              <h2 className="display-font mt-2 text-3xl text-[#0b364a] sm:text-4xl">Onde estão as oportunidades?</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#506570]">A base reúne <strong className="font-bold text-[#0b364a]">{formatNumber(vagas.length)} combinações</strong> de cargo e localidade presentes no edital enviado.</p>
          </div>

          <div className="grid items-start gap-7 lg:grid-cols-[318px_minmax(0,1fr)]">
            <aside className="relative overflow-hidden rounded-[1.5rem] border border-[#d9a63a]/25 bg-[#06293a] p-5 text-white shadow-[0_22px_50px_-32px_rgba(6,41,58,0.9)] lg:sticky lg:top-5">
              <img src="/manus-storage/ses-territorios-detalhe_ac29117f.png" alt="Detalhe cartográfico abstrato" className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-25" />
              <div className="relative">
                <div className="mb-7 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d9a63a] text-[#06293a]"><SlidersHorizontal className="h-5 w-5" /></span>
                  <div>
                    <p className="micro-label text-[#d9a63a]">Refinar rota · 08°S</p>
                    <h3 className="mt-1 text-base font-bold">Filtros de consulta</h3>
                  </div>
                </div>

                <div className="relative border-l border-[#d9a63a]/45 pl-5 before:absolute before:-left-1.5 before:top-1 before:h-3 before:w-3 before:rounded-full before:border-2 before:border-[#06293a] before:bg-[#d9a63a]">
                <label className="block text-sm font-semibold" htmlFor="cargo">Cargo ou especialidade</label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6ac8c8]" />
                  <input
                    id="cargo"
                    list="lista-cargos"
                    value={cargoQuery}
                    onChange={(event) => setCargoQuery(event.target.value)}
                    placeholder="Ex.: nefrologista"
                    className="h-11 w-full rounded-xl border border-white/15 bg-white/[0.09] pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#d9a63a] focus:ring-2 focus:ring-[#d9a63a]/30"
                  />
                  <datalist id="lista-cargos">
                    {cargos.map((cargo) => <option key={cargo} value={cargo} />)}
                  </datalist>
                </div>

                <label className="mt-5 block text-sm font-semibold">Município</label>
                <Select value={municipio} onValueChange={setMunicipio}>
                  <SelectTrigger className="mt-2 h-11 w-full rounded-xl border-white/15 bg-white/[0.09] text-left text-white hover:bg-white/[0.13] focus:ring-[#d9a63a]/40 [&_svg]:text-[#d9a63a]">
                    <SelectValue placeholder="Todos os municípios" />
                  </SelectTrigger>
                  <SelectContent className="border-[#d9a63a]/30 bg-[#fffdf5] text-[#0b364a]">
                    <SelectItem value="todos">Todos os municípios</SelectItem>
                    {municipios.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>

                <label className="mt-5 block text-sm font-semibold">Região de saúde</label>
                <Select value={regiao} onValueChange={setRegiao}>
                  <SelectTrigger className="mt-2 h-11 w-full rounded-xl border-white/15 bg-white/[0.09] text-left text-white hover:bg-white/[0.13] focus:ring-[#d9a63a]/40 [&_svg]:text-[#d9a63a]">
                    <SelectValue placeholder="Todas as regiões" />
                  </SelectTrigger>
                  <SelectContent className="border-[#d9a63a]/30 bg-[#fffdf5] text-[#0b364a]">
                    <SelectItem value="todas">Todas as regiões</SelectItem>
                    {regioes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Button onClick={limparFiltros} variant="ghost" className="mt-6 h-10 w-full justify-center rounded-xl border border-white/15 text-sm text-white hover:bg-white/10 hover:text-white">
                  <FilterX className="mr-2 h-4 w-4 text-[#d9a63a]" /> Limpar filtros
                </Button>
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#d9a63a]/30 bg-[#fffdf8] p-5 shadow-[0_16px_35px_-30px_rgba(6,41,58,0.7)]">
                  <div className="flex items-center justify-between"><span className="micro-label text-[#a46f11]">Vagas encontradas · nó 01</span><Cross className="h-4 w-4 text-[#d9a63a]" /></div>
                  <p className="display-font mt-4 text-4xl font-bold tracking-tight text-[#0b364a]">{formatNumber(resumo.vagas)}</p>
                  <p className="mt-1 text-sm text-[#5f727a]">soma dos resultados atuais</p>
                </div>
                <div className="rounded-2xl border border-[#0b364a]/10 bg-white p-5 shadow-[0_16px_35px_-30px_rgba(6,41,58,0.7)]">
                  <div className="flex items-center justify-between"><span className="micro-label text-[#2b7f80]">Cargos · nó 02</span><Stethoscope className="h-4 w-4 text-[#2b7f80]" /></div>
                  <p className="mt-4 text-4xl font-bold tracking-tight text-[#0b364a]">{formatNumber(resumo.cargos)}</p>
                  <p className="mt-1 text-sm text-[#5f727a]">perfis e especialidades</p>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-[#0b364a] p-5 text-white shadow-[0_16px_35px_-30px_rgba(6,41,58,0.85)]">
                  <img src="/manus-storage/ses-rotas-microatlas_6485de62.png" alt="Mini atlas abstrato" className="pointer-events-none absolute right-0 top-0 h-full w-1/2 object-cover opacity-30" />
                  <div className="relative"><div className="flex items-center justify-between"><span className="micro-label text-[#d9a63a]">Localidades · nó 03</span><MapPin className="h-4 w-4 text-[#d9a63a]" /></div>
                    <p className="mt-4 text-4xl font-bold tracking-tight">{formatNumber(resumo.municipios)}</p>
                    <p className="mt-1 text-sm text-[#c7dcdd]">municípios no resultado</p></div>
                </div>
              </div>

              <div className="my-6 overflow-hidden rounded-2xl border border-[#0b364a]/10 bg-[#eef6f3]">
                <div className="flex flex-wrap items-center gap-3 border-b border-[#0b364a]/10 px-5 py-3"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#0b364a]"><MapPin className="h-4 w-4 text-[#d9a63a]" /> Percurso territorial</span><span className="h-px min-w-8 flex-1 bg-[#0b364a]/10" /><span className="text-xs text-[#53666f]">Regiões atravessadas pela busca</span></div>
                <div className="flex gap-2 overflow-x-auto px-4 py-3">
                  {Object.entries(resultadosAgrupados).map(([nome, grupo], index) => <div key={nome} className="flex shrink-0 items-center gap-2 rounded-xl border border-[#0b364a]/10 bg-white px-3 py-2 text-xs text-[#39525b]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#0b364a] text-[10px] font-bold text-[#d9a63a]">{String(index + 1).padStart(2, "0")}</span><span className="font-semibold">{nome}</span><span className="font-bold text-[#a46f11]">{grupo.reduce((soma, vaga) => soma + vaga.total, 0)} vagas</span></div>)}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#0b364a]/10 bg-white shadow-[0_24px_60px_-45px_rgba(6,41,58,0.8)]">
                <div className="flex flex-col gap-3 border-b border-[#0b364a]/10 bg-[#fffdf8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="micro-label text-[#a46f11]">Resultado da busca</p>
                    <p className="mt-1 text-sm text-[#53666f]"><strong className="text-[#0b364a]">{formatNumber(resultados.length)} registros</strong> correspondem aos filtros atuais.</p>
                  </div>
                  <Button onClick={exportarCsv} variant="outline" className="h-9 rounded-xl border-[#0b364a]/15 bg-white text-xs font-bold text-[#0b364a] hover:bg-[#e7f3f1]">
                    <ArrowDownToLine className="mr-2 h-4 w-4" /> Baixar resultados
                  </Button>
                </div>

                {resultados.length ? (
                  <Table className="min-w-[920px]">
                    <TableHeader className="bg-[#eef6f3]">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-12 px-5 text-xs font-bold uppercase tracking-[0.11em] text-[#3d5a63]">Cargo</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-bold uppercase tracking-[0.11em] text-[#3d5a63]">Município</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-bold uppercase tracking-[0.11em] text-[#3d5a63]">Região de saúde</TableHead>
                        <TableHead className="h-12 px-4 text-center text-xs font-bold uppercase tracking-[0.11em] text-[#3d5a63]">Cotas</TableHead>
                        <TableHead className="h-12 px-5 text-right text-xs font-bold uppercase tracking-[0.11em] text-[#3d5a63]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(resultadosAgrupados).map(([nome, grupo], index) => <Fragment key={nome}>
                        <TableRow className="border-y border-[#d9a63a]/35 bg-[#fff8e2] hover:bg-[#fff8e2]"><TableCell colSpan={5} className="px-5 py-2.5"><div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#d9a63a] text-xs font-bold text-[#06293a]">{String(index + 1).padStart(2, "0")}</span><span className="display-font text-base font-bold text-[#0b364a]">{nome}</span><span className="text-xs font-semibold text-[#6e591e]">{new Set(grupo.map((vaga) => vaga.municipio)).size} municípios · {grupo.reduce((soma, vaga) => soma + vaga.total, 0)} vagas</span><span className="h-px flex-1 bg-[#d9a63a]/40" /></div></TableCell></TableRow>
                        {grupo.map((vaga) => <TableRow key={vaga.id} className="border-[#0b364a]/8 hover:bg-[#fff9e8]">
                          <TableCell className="px-5 py-4 font-semibold text-[#0b364a] whitespace-normal"><span className="max-w-[270px] block leading-5">{vaga.cargo}</span></TableCell>
                          <TableCell className="px-4 py-4 text-[#415a64]"><span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#d9a63a]" />{vaga.municipio}</span></TableCell>
                          <TableCell className="px-4 py-4"><span className="inline-flex rounded-full bg-[#e8f4f1] px-3 py-1 text-xs font-semibold text-[#17676b]">{vaga.regiaoSaude}</span></TableCell>
                          <TableCell className="px-4 py-4 text-center text-xs text-[#52666f]"><span title="Ampla concorrência">AC {vaga.amplaConcorrencia}</span><span className="mx-1.5 text-[#b9c5c7]">·</span><span title="Negros">N {vaga.negros}</span><span className="mx-1.5 text-[#b9c5c7]">·</span><span title="Pessoas com deficiência">PcD {vaga.pcd}</span><span className="mx-1.5 text-[#b9c5c7]">·</span><span title="Indígenas">I {vaga.indigenas}</span><span className="mx-1.5 text-[#b9c5c7]">·</span><span title="Quilombolas">Q {vaga.quilombolas}</span></TableCell>
                          <TableCell className="px-5 py-4 text-right"><span className="inline-flex min-w-11 justify-center rounded-xl bg-[#d9a63a] px-3 py-1.5 text-lg font-bold text-[#06293a]">{vaga.total}</span></TableCell>
                        </TableRow>)}
                      </Fragment>)}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="grid min-h-80 place-items-center px-6 py-12 text-center">
                    <div>
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f4f1] text-[#17676b]"><Search className="h-6 w-6" /></div>
                      <h3 className="display-font mt-5 text-2xl text-[#0b364a]">Nenhuma rota encontrada.</h3>
                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#53666f]">Tente remover um dos filtros ou pesquise somente uma parte do cargo, especialidade ou município.</p>
                      <Button onClick={limparFiltros} className="mt-5 rounded-xl bg-[#0b364a] text-white hover:bg-[#164e62]">Ver todas as vagas</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0b364a] px-5 py-11 text-white sm:px-8 lg:px-12">
          <img src="/manus-storage/ses-pontos-de-cuidado_a06fb47c.png" alt="Conexões territoriais abstratas" className="absolute inset-y-0 right-0 h-full w-full object-cover object-right opacity-35" />
          <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl"><p className="micro-label text-[#d9a63a]">Critério de transparência</p><h2 className="display-font mt-2 text-2xl sm:text-3xl">Dados estruturados a partir do quadro de vagas do edital enviado.</h2></div>
            <a href={sourcePdf} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15" download>Arquivo de origem <ArrowDownToLine className="h-4 w-4" /></a>
          </div>
        </section>
      </main>

      <footer className="bg-[#06293a] px-5 py-6 text-xs text-[#c7dcdd] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>Rota SES 2026 · consulta informativa de vagas por localidade.</p><p>Regiões de saúde associadas conforme o <a className="font-semibold text-[#d9a63a] underline-offset-4 hover:underline" href="https://central3.to.gov.br/arquivo/250909/" target="_blank" rel="noreferrer">PDR 2014 do Tocantins</a>.</p></div>
      </footer>
    </div>
  );
}
