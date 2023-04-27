build:
	docker build -t botadviser . 

run: 
	docker run -d -p 3000:3000 --name botadvicer --rm botadvicer