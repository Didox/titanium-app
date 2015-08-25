# -*- encoding : utf-8 -*-

Dado /^que estou na home$/ do
	@driver.navigate.to "file:///Users/sidneipacheco/projetos/vejasp-titanium/Resources/index.html"
  #sleep(10)
end

Então(/^verifique a existencia do topo$/) do
	@driver.find_element('css', 'header a.logo').text.should == "VEJA SÃO PAULO"
end

Então(/^verifique a existencia da lupa de busca$/) do
	@driver.find_element('css', 'header a.icon.find').nil?
end

Então(/^verifique a quantidade de itens do menu$/) do
	@driver.find_elements('css', '.menu ul li').count.should == 16
end

Então(/^ao clickar na lupa deve exibir campo de pesquisa$/) do
	@driver.find_element('css', 'header a.icon.find').click
	@driver.find_element('css', '.qu').css_value(:display).should == 'block'
end

Então(/^ao submeter uma busca deve me exibir a pagina de resultado de buscas$/) do
	@driver.find_element('css', '.qu').send_keys('fasano')
	@driver.find_element('css', '.qu').submit
	@driver.current_url.include?('busca')
	@driver.navigate.back
end

Então(/^após submeter uma busca deve haver registros no historico de buscas$/) do
	teste = @driver.find_elements('css', 'a.bsc_history_go').first
	teste.attribute('href').include?('fasano').should == true
end

Então(/^ao clickar no icone de restaurantes deve me redirecionar para pagina de busca$/) do
	@driver.find_element('css', '.icon-restaurantes').click
	@driver.find_element('css', '.bscNoResult').text.should == "Resultados para Restaurantes"
	@driver.navigate.back
end
