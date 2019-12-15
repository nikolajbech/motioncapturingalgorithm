import cv2
import socket

UDP_IP = "127.0.0.1"
UDP_PORT = 33333
MESSAGE = "Sending UDP"

print "UDP target IP:", UDP_IP
print "UDP target port:", UDP_PORT
print "message:", MESSAGE

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP

cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

ret, current_frame = cap.read()
previous_frame = current_frame
prev_previous_frame = current_frame

while(cap.isOpened()):
	current_frame_gray = cv2.cvtColor(current_frame, cv2.COLOR_BGR2GRAY)
	previous_frame_gray = cv2.cvtColor(previous_frame, cv2.COLOR_BGR2GRAY)

	current_frame_gray = cv2.GaussianBlur(current_frame_gray,(101,101),cv2.BORDER_DEFAULT)
	previous_frame_gray = cv2.GaussianBlur(previous_frame_gray,(101,101),cv2.BORDER_DEFAULT)

	frame_diff = cv2.absdiff(current_frame_gray,previous_frame_gray)

	frame_resized_flipped = cv2.resize(frame_diff, (24, 12), interpolation = cv2.INTER_AREA) # Resize image
	frame_resized = cv2.flip( frame_resized_flipped, 1 )

	pixelSum = 0
	for x in range(0, 12):
		for y in range(0, 24):
			pixelSum += frame_resized[x,y]

	pixelSum = pixelSum / (24 * 12)

	for x in range(0, 12):
		for y in range(0, 24):
			frame_resized[x,y] = 50 if frame_resized[x,y] > pixelSum + 10 else 0

	frame_resized = cv2.GaussianBlur(frame_resized,(3,3),cv2.BORDER_DEFAULT)

	imageString = ""
	for i in range(0, 12):
		for j in range(0, 24):
			imageString = imageString + "," + str(frame_resized[i,j])

	print(imageString)

	sock.sendto(imageString, (UDP_IP, UDP_PORT))

	cv2.imshow('frame diff ',frame_resized)      
	if cv2.waitKey(1) & 0xFF == ord('q'):
		break

	previous_frame = current_frame.copy()
	ret, current_frame = cap.read()

cap.release()
cv2.destroyAllWindows()