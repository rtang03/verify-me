db.auth('root', 'example')

db = db.getSiblingDB('did-db')

db.createUser({
  user: 'tester',
  pwd: 'tester-password',
  roles: [
    {
      role: 'readWrite',
      db: 'did-db',
    },
  ],
})
