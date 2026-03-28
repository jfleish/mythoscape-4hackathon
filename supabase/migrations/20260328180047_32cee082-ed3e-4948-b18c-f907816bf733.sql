UPDATE books SET 
  title = 'The Iliad',
  author = 'Homer',
  description = 'An ancient Greek epic poem set during the Trojan War, telling the story of the wrath of Achilles.',
  world_marble_url = 'https://marble.worldlabs.ai/viewer.html?splatUrl=https%3A%2F%2Fcdn.marble.worldlabs.ai%2Fd7780ed7-3ff0-48ec-a59c-2f81900d5c71%2F51d1d224-1ad7-4ba0-9a06-2b19160c0e48_ceramic.spz&mobileUrl=https%3A%2F%2Fcdn.marble.worldlabs.ai%2Fd7780ed7-3ff0-48ec-a59c-2f81900d5c71%2F189b2521-64c2-434f-b4ef-7de07bd2068c_ceramic_500k.spz&marbleWorldId=d7780ed7-3ff0-48ec-a59c-2f81900d5c71',
  world_prompt = 'Ancient Troy during the Trojan War, bronze age battlefield with Greek ships on the shore',
  updated_at = now()
WHERE id = '3eba999f-2f20-4c88-b1f0-a9b40dd07430';