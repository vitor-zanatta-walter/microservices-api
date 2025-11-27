
export default class UserView {

static render(user) {
    if (!user) return null;

    const out = {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        created_at: user.created_at,
    };

    // Só adiciona se realmente existir no objeto
    if (user.is_attendant !== undefined && user.is_attendant !== null) {
        out.is_attendant = user.is_attendant === 1;
    }

    return out;
}



}