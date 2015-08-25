class CreateNovoCarros < ActiveRecord::Migration
  def change
    create_table :novo_carros do |t|
      t.string :nome
      t.string :marca
      t.string :modelo

      t.timestamps
    end
  end
end
