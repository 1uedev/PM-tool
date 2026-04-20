#!/usr/bin/env python3
import zipfile
import xml.etree.ElementTree as ET
import sys

docx_path = '/Users/holgergerlach/Library/Application Support/Claude/local-agent-mode-sessions/24388eff-58e2-453c-b562-1bedfc70df94/0b443eae-930e-4965-a2ce-53a86c522f33/local_0fa5939d-fded-4a5c-992d-22dced0e211f/uploads/PM-Copilot-Spec-v1.docx'

try:
    with zipfile.ZipFile(docx_path, 'r') as docx:
        xml_content = docx.read('word/document.xml')

    root = ET.fromstring(xml_content)
    namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

    text_parts = []
    for elem in root.iter():
        if elem.tag.endswith('}t'):
            if elem.text:
                text_parts.append(elem.text)

    full_text = ''.join(text_parts)
    sys.stdout.write(full_text)

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
