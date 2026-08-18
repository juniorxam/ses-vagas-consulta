import json
import re
from pathlib import Path

RAW_PATH = Path('/home/ubuntu/ses-vagas-consulta/data-work/edital-raw.txt')
OUT_PATH = Path('/home/ubuntu/ses-vagas-consulta/client/src/data/vagas.json')

MUNICIPIOS = {
    'PORTO NACIONAL': {'municipio': 'Porto Nacional', 'regiaoSaude': 'Amor Perfeito'},
    'AUGUSTINOPOLIS': {'municipio': 'Augustinópolis', 'regiaoSaude': 'Bico do Papagaio'},
    'PARAISO': {'municipio': 'Paraíso do Tocantins', 'regiaoSaude': 'Cantão'},
    'MIRACEMA': {'municipio': 'Miracema do Tocantins', 'regiaoSaude': 'Capim Dourado'},
    'PALMAS': {'municipio': 'Palmas', 'regiaoSaude': 'Capim Dourado'},
    'ARAPOEMA': {'municipio': 'Arapoema', 'regiaoSaude': 'Cerrado Tocantins Araguaia'},
    'PEDRO AFONSO': {'municipio': 'Pedro Afonso', 'regiaoSaude': 'Cerrado Tocantins Araguaia'},
    'ALVORADA': {'municipio': 'Alvorada', 'regiaoSaude': 'Ilha do Bananal'},
    'ARAGUAÇU': {'municipio': 'Araguaçu', 'regiaoSaude': 'Ilha do Bananal'},
    'GURUPI': {'municipio': 'Gurupi', 'regiaoSaude': 'Ilha do Bananal'},
    'ARAGUAINA': {'municipio': 'Araguaína', 'regiaoSaude': 'Médio Norte Araguaia'},
    'GUARAI': {'municipio': 'Guaraí', 'regiaoSaude': 'Cerrado Tocantins Araguaia'},
    'XAMBIOA': {'municipio': 'Xambioá', 'regiaoSaude': 'Médio Norte Araguaia'},
    'ARRAIAS': {'municipio': 'Arraias', 'regiaoSaude': 'Sudeste'},
    'DIANOPOLIS': {'municipio': 'Dianópolis', 'regiaoSaude': 'Sudeste'},
}

HEADERS = {
    'CARGO', 'AMPLA', 'CONCORRÊNCIA', 'NEGROS', '(10%)', 'PCDS', 'PCD', 'PcD',
    'INDÍGENAS', 'QUILOMBOLAS', 'TOTAL'
}

ROW_PATTERN = re.compile(r'^(.*?)(?:\s+)(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$')
NUMBERS_PATTERN = re.compile(r'^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$')


def clean_fragment(value: str) -> str:
    return re.sub(r'\s+', ' ', value.replace('\f', ' ')).strip()


def is_page_number(value: str) -> bool:
    return bool(re.fullmatch(r'\d{1,3}', value))


def add_record(registros: list[dict], localidade: dict, cargo: str, values: list[int]) -> None:
    cargo = clean_fragment(cargo)
    if not cargo:
        raise ValueError(f'Linha de números sem cargo: {values}')
    ampla, negros, pcd, indigenas, quilombolas, total = values
    if ampla + negros + pcd + indigenas + quilombolas != total:
        raise ValueError(f'Total inconsistente para {cargo}: {values}')
    registros.append({
        'id': f"{localidade['municipio'].lower().replace(' ', '-')}-{len(registros) + 1}",
        'cargo': cargo,
        'municipio': localidade['municipio'],
        'regiaoSaude': localidade['regiaoSaude'],
        'amplaConcorrencia': ampla,
        'negros': negros,
        'pcd': pcd,
        'indigenas': indigenas,
        'quilombolas': quilombolas,
        'total': total,
    })


def parse() -> list[dict]:
    text = RAW_PATH.read_text(encoding='utf-8')
    start = text.index('ANEXO II – QUADRO DE VAGAS')
    end = text.index('ANEXO III – CARGOS', start)
    lines = text[start:end].splitlines()

    registros = []
    localidade = None
    pending = []

    for raw in lines:
        line = clean_fragment(raw)
        if not line or line == 'ANEXO II – QUADRO DE VAGAS' or line.startswith('(Por Cargo'):
            continue
        if line in MUNICIPIOS:
            localidade = MUNICIPIOS[line]
            pending = []
            continue
        if localidade is None:
            continue
        if line in HEADERS or is_page_number(line) or line.upper().startswith('TOTAL '):
            pending = []
            continue

        numbers_only = NUMBERS_PATTERN.match(line)
        if numbers_only:
            if pending:
                add_record(registros, localidade, ' '.join(pending), [int(item) for item in numbers_only.groups()])
                pending = []
            continue

        matched = ROW_PATTERN.match(line)
        if matched:
            cargo_prefix = clean_fragment(matched.group(1))
            values = [int(item) for item in matched.groups()[1:]]
            cargo = clean_fragment(' '.join([*pending, cargo_prefix]))
            pending = []

            if cargo.lower() == 'total':
                continue
            add_record(registros, localidade, cargo, values)
            continue

        pending.append(line)

    if not registros:
        raise ValueError('Nenhum registro de vaga foi extraído.')
    return registros


def main() -> None:
    registros = parse()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(registros, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'registros': len(registros),
        'vagasTotais': sum(item['total'] for item in registros),
        'municipios': sorted({item['municipio'] for item in registros}),
        'regioes': sorted({item['regiaoSaude'] for item in registros}),
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
