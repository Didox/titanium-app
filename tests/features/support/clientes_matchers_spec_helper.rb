RSpec::Matchers.define :list_evento do |expected, opts|
  match do |actual|
    page.should have_xpath(seletor_evento(expected))

    within(:xpath, seletor_evento(expected)) do
      page.should have_content(opts[:tipo])
    end
  end
end

def seletor_evento(nome)
  class_matcher   = "[@class='evento']"
  content_matcher = "[contains(child::*, '#{nome}')]"
  "//*#{class_matcher}#{content_matcher}"
end
