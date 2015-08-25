# language: pt
Funcionalidade: Testar o App Vejinha
  Entrar e testar

  @javascript
  Cenário: Acessar a home
    Dado que estou na home
    Então verifique a existencia do topo
    Então verifique a existencia da lupa de busca
    Então verifique a quantidade de itens do menu
    Então ao clickar na lupa deve exibir campo de pesquisa
    Então ao submeter uma busca deve me exibir a pagina de resultado de buscas
    Então após submeter uma busca deve haver registros no historico de buscas
    Então ao clickar no icone de restaurantes deve me redirecionar para pagina de busca