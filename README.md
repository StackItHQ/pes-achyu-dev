[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/AHFn7Vbn)
# Superjoin Hiring Assignment

### Welcome to Superjoin's hiring assignment! 🚀

### Objective
Build a solution that enables real-time synchronization of data between a Google Sheet and a specified database (e.g., MySQL, PostgreSQL). The solution should detect changes in the Google Sheet and update the database accordingly, and vice versa.

### Problem Statement
Many businesses use Google Sheets for collaborative data management and databases for more robust and scalable data storage. However, keeping the data synchronised between Google Sheets and databases is often a manual and error-prone process. Your task is to develop a solution that automates this synchronisation, ensuring that changes in one are reflected in the other in real-time.

### Requirements:
1. Real-time Synchronisation
  - Implement a system that detects changes in Google Sheets and updates the database accordingly.
   - Similarly, detect changes in the database and update the Google Sheet.
  2.	CRUD Operations
   - Ensure the system supports Create, Read, Update, and Delete operations for both Google Sheets and the database.
   - Maintain data consistency across both platforms.
   
### Optional Challenges (This is not mandatory):
1. Conflict Handling
- Develop a strategy to handle conflicts that may arise when changes are made simultaneously in both Google Sheets and the database.
- Provide options for conflict resolution (e.g., last write wins, user-defined rules).
    
2. Scalability: 	
- Ensure the solution can handle large datasets and high-frequency updates without performance degradation.
- Optimize for scalability and efficiency.

## Submission ⏰
The timeline for this submission is: **Next 2 days**

Some things you might want to take care of:
- Make use of git and commit your steps!
- Use good coding practices.
- Write beautiful and readable code. Well-written code is nothing less than a work of art.
- Use semantic variable naming.
- Your code should be organized well in files and folders which is easy to figure out.
- If there is something happening in your code that is not very intuitive, add some comments.
- Add to this README at the bottom explaining your approach (brownie points 😋)
- Use ChatGPT4o/o1/Github Co-pilot, anything that accelerates how you work 💪🏽. 

Make sure you finish the assignment a little earlier than this so you have time to make any final changes.

Once you're done, make sure you **record a video** showing your project working. The video should **NOT** be longer than 120 seconds. While you record the video, tell us about your biggest blocker, and how you overcame it! Don't be shy, talk us through, we'd love that.

We have a checklist at the bottom of this README file, which you should update as your progress with your assignment. It will help us evaluate your project.

- [✓ ] My code's working just fine! 🥳
- [✓] I have recorded a video showing it working and embedded it in the README ▶️
- [✓] I have tested all the normal working cases 😎
- [✓] I have even solved some edge cases (brownie points) 💪
- [✓] I added my very planned-out approach to the problem at the end of this README 📜


## Got Questions❓
Feel free to check the discussions tab, you might get some help there. Check out that tab before reaching out to us. Also, did you know, the internet is a great place to explore? 😛

We're available at techhiring@superjoin.ai for all queries. 

All the best ✨.

## Developer's Section

This project demonstrates real time synchronization between MySQL Database and Google sheets. For the purpose of this task, I made use of the Google Sheets API for connectingm my Google sheet to the Backend DB (which is MySQL in my case). 

Coming to the overall tech stack of the website, I have used Next js. The reason for my choice of next js, is due to its simplicity to handle server side rendering and API Routes thus making it more robust and optimal for real time synchronization.

Here are some of the key features of this project - 
* Manual sync triggering 
* Automatic syncing every 2 seconds 
* Real time sync status updates shown on the screen
* Responsive UI 

Technology stack -
* Next.js (React framework)
* Prisma (ORM for Database interactions)
* Google Sheets API 
* ``node-cron`` (for scheduling real time synchronizaton between Google sheet and DB)
* shadcn/ui & Tailwind CSS (For styling)

The project structure is as below - 

```
superjoin-realtime/
├── app/
│   ├── api/
│   │   ├── autosyncstatus/
│   │   ├── startAutoSync/
│   │   └── stopAutoSync/
|   |   |---lastsynctime/ 
│   ├── actions/
│   │   └── syncsheet.ts
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   └── scheduledSync.ts
├── prisma/
|   |---migrations/
│   └── schema.prisma
└── next.config.js
```

The **Approach** is as below - 

1. Google Sheets API - We use Google Sheets API to fetch the data from a specific Google sheet. The authentication of this is setup as service account

2. Database synchonization - The sync process compares the data from Google Sheets with the existing database records. It updates changed records and inserts new ones, ensuring the database stays in sync with the Google Sheet.

3. Server side actions - We use Next.js server actions to handle the synchronization process, allowing us to perform database operations securely on the server-side while providing a seamless interface for the client-side code.

4. Real time updates - Every 2 seconds, we get an update on the client side dashboard showing when it was last synced

5. Error handling - Comprehensive error handling is implemented throughout the application, from API calls to database operations. Errors are caught, logged, and displayed to users when appropriate.

6. Automatic synchronizaton - used ``node-cron`` to scheduled a sync process every 2 seconds. This can be either stopped or started using the UI


## Steps to run the project

1. Clone the repository 

```
git clone https://github.com/StackItHQ/pes-achyu-dev.git
```

2. Install all the required dependencies - 

```
npm install
```

You also have to install several shadcn/ui components and other UI tools as below - 

For lucide-react - 

```
npm i lucide-react
```

To setup shadcn for the first time, you can run the below command - 

```
npx shadcn@latest init
```

or if you want to set for defaults (i.e, ``new-york``, ``zinc`` and ``yes``) for the CSS variables, use the `-d` flag

For alert -

```
npx shadcn@latest add alert
```

For Button -

```
npx shadcn@latest add button
```

For Card -

```
npx shadcn@latest add card
```

Run the below command to install required packages for Google APIs-

```
npm i @googleapis/sheets
```


3. Setup the `.env` and `.env.local` files -

`.env` format - 

```
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

Here ``DATABASE`` corresponds to the database name

`.env.local` format - 

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CLIENT_EMAIL=your_client_email
GOOGLE_SHEET_ID=your_sheet_id
```

In order to get all these details above, you have to follow below sub steps - 

a. Head over to [Google Cloud services](https://console.cloud.google.com/welcome?project=superjoin-realtime)

b. Create a Project named "your-project-name"

c. Right Click on the sidebar -> APIs and Services -> Enabled APIs and Services -> Google Sheets API

d. Clicko on Enable, which enables the API for the project

e. Then, Click on "Create credentials" to create a ``Service account``. 

f. Once you make an account, click on `Keys` tab and then create a Key in JSON form, which contains list of details that can be entered in the ``.env.local`` file.

4. Connecting Prisma -

Run the below command to initialize Prisma - 

```
npx prisma init
```

You will now see a folder called `prisma` in your project's root directory. 

update your `prisma.schema` model as - 

```
model Sheet {
  id        String   @id @default(cuid())
  rowId     String?
  column1   String?
  column2   String?
  column3   String?
  updatedAt DateTime @updatedAt
  lastSyncedAt DateTime? 
}
```

You can make changes to column names as per requirements. 

Run the below command to run migrations (this command has to be run everytime there is any change to the schema)

```
npx prisma migrate dev --name init
```

This command does two things:

1. It creates a new SQL migration file for this migration

2. It runs the SQL migration file against the database

Now, you can seamlessly interact with the Database.


4. Run the development server -

```
npm run dev
```

Then you can see your website running at http://localhost:3000

![UI Frontend](image.png)

Click on "Trigger Manual Sync" in order to sync the MySQL Database and the Google Sheet, manually.

![Manual trigger](image-1.png)

Click on the "Start Auto Sync (Every 2 seconds)" button to trigger auto sync every 2 seconds.

![Auto sync On](image-2.png)

You can now see the status as "On" 

Similary you can now, stop the Sync to stop the synchronization.


5. Refer the Vidoe Link below, for the Video demonstration -


