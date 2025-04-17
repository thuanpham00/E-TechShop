/* eslint-disable @typescript-eslint/no-explicit-any */
import { Editor } from "@tinymce/tinymce-react"
import { useRef } from "react"

interface TinyEditorProps {
  value: string
  setValue: (val: string) => void
}

export default function TextEditor({ value, setValue }: TinyEditorProps) {
  const editorRef = useRef<any>(null)

  return (
    <Editor
      apiKey="0vra4o5ncy0qcgf9dznjxrtbiwyy3kifj8kojxoqe8vhxdxk"
      onInit={(_: any, editor: any) => (editorRef.current = editor)}
      value={value}
      onEditorChange={(newValue: any) => setValue(newValue)}
      init={{
        height: 300,
        menubar: false,
        plugins: ["advlist", "autolink", "lists", "link", "help"],
        toolbar:
          "undo redo | bold italic underline | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help",
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        block_formats: "Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6" // Thêm để đảm bảo formatselect hiển thị
      }}
    />
  )
}
