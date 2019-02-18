# List of guide files to search
guides = ['analytics_guide.md','angular_guide.md','api_guide.md','authentication_guide.md','cache_guide.md','hub_guide.md','i18n_guide.md','interactions_guide.md','logger_guide.md','pub_sub_guide.md','push_notifications_setup.md','service_workers_guide.md','storage_guide.md']

# Start of file path - CHANGE FOR GITHUB
filestart = '../docs/media/'

# Opens snippet file
snippets = open('snippets/auto.code-snippets','w')

# Opens documentation file
docs = open('auto_snippet_documentation.md','w')

# Starts writing files
docs.write('# Automatically Generated Snippet Documentation\n')
snippets.write('{\n')

# Loops through all guide pages
for guide in guides:
    snippet_index = 1 # counts number of snippets in each section for snippet naming
    _guide_index = guide.find('_guide')
    title = guide[:_guide_index] # gets doc title for snippet naming
    
    # Read doc file and separate into lines
    f = open(filestart + guide,'r')
    lines = f.readlines()
    f.close()
    
    line_index = 0 # index for which line is being used
    while line_index < len(lines):
        # Finds most recent header
        heading = title.title()
        if lines[line_index][0] == '#':
            snippet_index = 1
            line = lines[line_index]
            for char_index in range(len(line)):
                if line[char_index].isalpha():
                    header = line[char_index:len(line)-1].title()
                    break
        # Finds start of javascript codeblock
        languages = ['js', 'typescript', 'json']
        for language in languages:
            if lines[line_index].strip() == '```' + language:
                # Adds beginning snippet formatting to doc file and snippet file
                snippet_number = '' if snippet_index == 1 else (' ' + str(snippet_index))
                docs.write('##### prefix: ```Amplify ' + header + snippet_number + '```\n```' + language + '\n')
                snippets.write('    "Amplify ' + title.title() + ' ' + header + snippet_number + '": {\n')
                snippets.write('        "prefix": "Amplify ' + header + snippet_number + '",\n')
                if language == 'js':
                    snippets.write('        "scope": "javascript,javascriptreact,typescript",\n')
                else:
                    snippets.write('        "scope": "' + language + '",\n')
                snippets.write('        "body": [\n')           
                line_index += 1 # increment line index
                # Adds lines to snippet
                while lines[line_index].strip() != '```': # executes until end of code block
                    docs.write(lines[line_index]) # writes line directly to doc
                    line_str = '            "'
                    # Adds \t's to snippet
                    space_count = 0
                    for char in lines[line_index]:
                        if char == ' ':
                            space_count += 1
                        else:
                            line_str += '\\t'*int(space_count/4)
                            lines[line_index] = lines[line_index][space_count:]
                            break
                    # Checks for special characters and adds line to snippet
                    for char in lines[line_index]:
                        if char == '"':
                            line_str += '\\"'
                        elif char == "$":
                            line_str += '\\\$'
                        elif char == '\n':
                            pass 
                        else:
                            line_str += char
                    line_str += '",'
                    snippets.write(line_str + '\n')
                    line_index += 1 # increment line index
                # Close snippet and doc line
                docs.write('```\n')
                snippets.write('        ]\n')
                snippets.write('    },\n')
                snippet_index += 1
        line_index += 1 # increment line index
# Close snippet file and doc file           
snippets.write('}')
snippets.close()
docs.close()