import asyncio
import websockets
import random
import pygame
import sys
import json

from pygame.locals import *

WINDOWWIDTH = 640 # size of window's width in pixels
WINDOWHEIGHT = 480 # size of windows' height in pixels
CENTREX = (WINDOWWIDTH / 2)
CENTREY = (WINDOWHEIGHT / 2)

#            R    G    B
YELLOW     = (255, 255,   0)
GREEN      = (  0, 255,   0)
WHITE      = (255, 255, 255)
BLACK      = (  0,   0,   0)

@asyncio.coroutine
def readGameState(websocket, gameState):
    while True:
        gameStateDeltaString = yield from websocket.recv()
        print(gameStateDeltaString)

        gameStateDelta = json.loads(gameStateDeltaString)
        for newFood in gameStateDelta['foodDelta']['newFood']:
            gameState['food'][newFood['id']] = newFood

        for eatenFood in gameStateDelta['foodDelta']['eatenFood']:
            gameState['food'].pop(eatenFood, None)

        gameState['players'] = gameStateDelta['players']
        gameState['me'] = gameStateDelta['me']

@asyncio.coroutine
def main():
    websocket = yield from websockets.connect('wss://polar-forest-9270.herokuapp.com/')

    global FPSCLOCK, DISPLAYSURF
    pygame.init()
    DISPLAYSURF = pygame.display.set_mode((WINDOWWIDTH, WINDOWHEIGHT))

    gameState = { 'food': {}, 'players': [], 'me': None }
    pygame.display.set_caption('Memory Game')

    gameStateDelta = []
    asyncio.async(readGameState(websocket, gameState))

    while True:
        pygame.event.pump() # advance pygame event loop

        DISPLAYSURF.fill(WHITE)

        drawBlobbies(gameState)

        pygame.display.update()

        for event in pygame.event.get(): # event handling loop
            if event.type == QUIT or (event.type == KEYUP and event.key == K_ESCAPE):
                yield from websocket.close()
                pygame.quit()
                sys.exit()
            elif event.type == MOUSEMOTION:
                mousex, mousey = event.pos
                offsetx = mousex - (WINDOWWIDTH / 2)
                offsety = mousey - (WINDOWHEIGHT / 2)
                yield from websocket.send('{\"x\":' + str(offsetx)+ ', \"y\": ' + str(offsety) + '}')

        yield from asyncio.sleep(0.016) # advance asyncio loop

def drawBlobbies(gameState):
    if (gameState['me'] != None):
        for k,v in gameState['food'].items():
            drawBlobby(gameState['me'], v)

        for player in gameState['players']:
            drawBlobby(gameState['me'], player)

        drawBlobby(gameState['me'], gameState['me'])

def drawBlobby(me, blobby):
    viewPortLeft = me['x'] - CENTREX;
    viewPortTop = me['y'] - CENTREY;

    offsetX = int(blobby['x'] - viewPortLeft);
    offsetY = int(blobby['y'] - viewPortTop);

    pygame.draw.circle(DISPLAYSURF, getColour(blobby['colour']), (offsetX, offsetY), int(blobby['size']))
    pygame.draw.circle(DISPLAYSURF, BLACK, (offsetX, offsetY), int(blobby['size']), 1)

def getColour(colourName):
    if colourName == 'yellow':
        return YELLOW
    elif colourName == 'green':
        return GREEN
    else:
        return BLACK

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
