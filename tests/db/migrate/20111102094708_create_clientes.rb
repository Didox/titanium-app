class CreateClientes < ActiveRecord::Migration
  def change
    create_table :clientes do |t|
      t.string :nome
      t.integer :idade
      t.string :endereco
      t.string :cidade
      t.string :estado
      t.string :pais

      t.timestamps
    end
  end
end
