-- Tabela de produtos
create table if not exists produtos (
  id bigint generated always as identity primary key,
  titulo text not null,
  preco numeric(10, 2) not null,
  descricao text,
  criado_em timestamptz default now()
);

-- Fotos dos produtos
create table if not exists fotos_produto (
  id bigint generated always as identity primary key,
  produto_id bigint references produtos(id) on delete cascade,
  url text not null,
  ordem int default 0
);

-- Estoque por tamanho
create table if not exists estoque_itens (
  id bigint generated always as identity primary key,
  produto_id bigint references produtos(id) on delete cascade,
  tamanho text check (tamanho in ('PP', 'P', 'M', 'G', 'GG', 'XG')),
  quantidade int default 0,
  unique (produto_id, tamanho)
);

-- Habilitar acesso público (ajustar conforme necessidade de auth)
alter table produtos enable row level security;
alter table fotos_produto enable row level security;
alter table estoque_itens enable row level security;

create policy "leitura publica" on produtos for select using (true);
create policy "leitura publica" on fotos_produto for select using (true);
create policy "leitura publica" on estoque_itens for select using (true);

create policy "escrita publica" on produtos for all using (true);
create policy "escrita publica" on fotos_produto for all using (true);
create policy "escrita publica" on estoque_itens for all using (true);

-- Storage bucket para fotos
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict do nothing;

create policy "upload publico" on storage.objects
for insert with check (bucket_id = 'fotos');

create policy "leitura publica storage" on storage.objects
for select using (bucket_id = 'fotos');

create policy "deletar publico" on storage.objects
for delete using (bucket_id = 'fotos');
