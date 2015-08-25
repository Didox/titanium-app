class CreateCarros < ActiveRecord::Migration
  def change
    create_table :carros do |t|
      t.string :nome
      t.string :marca
      t.string :modelo

      t.timestamps
    end
  end
end
