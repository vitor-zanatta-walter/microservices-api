
// Gera query de update ignorando campos undefined
export default function updateQueryGenerator(table, items, names, where, whereParams){
    
    let fields = [];
    let params = [];

    for(let i=0 ; i<items.length ; i++){
        
        if (items[i] !== undefined){
            fields.push(names[i] + " = ?");
            params.push(items[i]);
        }

    }

    if (fields.length === 0){
        throw new Error("Nenhum atributo foi alterado");
    }

    const query = `UPDATE ${table} SET ${fields.join(', ')} WHERE ${where}`;

    return {query, params:[...params, ...whereParams]};
}
