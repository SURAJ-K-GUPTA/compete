import Editor from '../components/Editor'

const YourPage = () => {
  const handleChange = (content: string) => {
    console.log('Editor content changed:', content)
  }

  return (
    <Editor 
      initialContent="<p>Start typing...</p>"
      onChange={handleChange}
    />
  )
} 