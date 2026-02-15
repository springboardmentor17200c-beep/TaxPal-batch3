// In-memory mock database for development/testing without MongoDB
// WARNING: Data will be lost on server restart!

let users = [
  {
    _id: "1",
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    country: "USA",
    income_bracket: "Middle",
    resetToken: null,
    resetTokenExpiry: null
  }
];

let transactions = [
  {
    _id: "1",
    user_id: "1",
    type: "income",
    source: "Client Project",
    amount: 2000,
    date: new Date("2024-03-10")
  },
  {
    _id: "2",
    user_id: "1",
    type: "expense",
    category: "Software",
    amount: 100,
    date: new Date("2024-03-11")
  }
];

let userIdCounter = 2;
let txIdCounter = 3;

export const mockDB = {
  users: {
    findOne: async (query) => {
      return users.find(u => {
        if (query.email) return u.email === query.email;
        if (query._id) return u._id === query._id;
        return false;
      });
    },
    create: async (data) => {
      const newUser = {
        ...data,
        _id: String(userIdCounter++),
        resetToken: null,
        resetTokenExpiry: null
      };
      users.push(newUser);
      return newUser;
    },
    find: async () => users,
    findByIdAndUpdate: async (id, data) => {
      const user = users.find(u => u._id === id);
      if (user) Object.assign(user, data);
      return user;
    }
  },
  
  transactions: {
    create: async (data) => {
      const newTx = {
        ...data,
        _id: String(txIdCounter++)
      };
      transactions.push(newTx);
      return newTx;
    },
    find: async (query = {}) => {
      if (query.user_id) {
        return transactions.filter(t => t.user_id === query.user_id);
      }
      return transactions;
    },
    findById: async (id) => transactions.find(t => t._id === id),
    findByIdAndUpdate: async (id, data) => {
      const tx = transactions.find(t => t._id === id);
      if (tx) Object.assign(tx, data);
      return tx;
    },
    deleteOne: async (query) => {
      const idx = transactions.findIndex(t => t._id === query._id);
      if (idx >= 0) transactions.splice(idx, 1);
      return { deletedCount: idx >= 0 ? 1 : 0 };
    }
  }
};
