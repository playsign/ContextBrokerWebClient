import slimit

f = file('SmartSantanderData.js')
d = f.read()

lexer = slimit.lexer.Lexer()
lexer.input(d)

def step(typestr):
    token = lexer.token()
    assert token.type == typestr
    return token

#counter for markers, also to sanity check parsing
idx = 0

while True:
    t = lexer.token()
    if not t:
        break

    #print t.type, t.value
    if t.value == 'LatLng':
        maybeparen = lexer.token()
        if maybeparen.type == 'LPAREN':
            lat = step('NUMBER')
            step('COMMA')
            step('MINUS')
            lng = step('NUMBER')
            print "*** FOUND:", float(lat.value), -float(lng.value),
            idx += 1
            if idx == 1051: #apparently an exception at the end
                idx = 1053

            while True:
                t = lexer.token()
                if t.type == 'ID' and t.value.startswith('title'):
                    titlenum = int(t.value[5:])
                    print titlenum, idx
                    assert titlenum == idx
                    step('EQ')
                    xml = step('STRING')
                    print xml #...
                    break
            
        else:
            print "-!- NOT:", maybeparen

"""
>>> dir(t)
['__class__', '__delattr__', '__dict__', '__doc__', '__format__', '__getattribute__', '__hash__', '__init__', '__module__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'lexpos', 'lineno', 'type', 'value']
>>> t.type
'PERIOD'
>>> t.value
'.'
>>> t = lexer.token()
>>> t.type
'ID'
>>> t.value
'maps'
>>> t
LexToken(ID,'maps',1,30)

LexToken(VAR,'var',1,7)
"""
