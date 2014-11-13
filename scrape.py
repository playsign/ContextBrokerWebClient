import xml.etree.ElementTree as ET
import json
import slimit #javascript parser

f = file('SmartSantanderData.js')
d = f.read()

lexer = slimit.lexer.Lexer()
lexer.input(d)

def step(typestr):
    token = lexer.token()
    assert token.type == typestr
    return token

def sensorxml(xmlstr):
    #print xmlstr
    sdata = {}
    root = ET.fromstring(xmlstr)
    for child in root:
        #print child.tag, child.attrib, child.text
        entries = child.text.split(';')
        #print entries
        for e in entries:
            ds = e.split(':')
            #print ds
            sdata[ds[0]] = ds[1].strip()
    #print sdata
    return sdata

#counter for markers, also to sanity check parsing
idx = 0

nodeinfo = {} #this is our result. nodeid: 'geopos', 'data'

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
            lnglat = float(lat.value), -float(lng.value),
            print "*** FOUND:", lnglat
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

                    #print xml #...
                    xmlstr = xml.value
                    xmlstr = xmlstr[1:-1]
                    xmlstr = xmlstr.replace('</br><br>', ';') #was invalid xml
                    xmlstr = xmlstr.replace('</br>', '')
                    
                    #print type(xmlstr), xmlstr
                    sdata = sensorxml(xmlstr)
                    try:
                        nodeinfo[sdata['Node']] = {
                            'geopos': lnglat,
                            'data': sdata
                            }
                    except KeyError:
                        #print "Invalid?", sdata #seems to be the Meshlium
                        pass
                        
                    break
            
        else:
            print "-!- NOT:", maybeparen

#print nodeinfo
with open('nodeinfo.json', 'w') as fp:
    json.dump(nodeinfo, fp, indent=4)

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
