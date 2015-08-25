Dado /^que abri o aplicativo$/ do
	@driver.navigate.to "file:///Users/sidneipacheco/projetos/vejasp-titanium/Resources/index.html"
end

Então(/^deve conter o topo$/) do
	verifica_topo_index(@driver)
	@driver.navigate.to "file:///Users/sidneipacheco/projetos/vejasp-titanium/Resources/busca.html#&&category-meta_nav%3ARestaurantes"
	verifica_topo_busca(@driver)
end
